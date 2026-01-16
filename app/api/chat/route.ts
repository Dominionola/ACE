import { createClient } from "@/lib/supabase/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { convertToModelMessages, streamText, UIMessage } from "ai";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const maxDuration = 30;

// Helper to fetch user's academic context
async function getUserAcademicContext(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
    // Fetch grades
    const { data: grades, error: gradesError } = await supabase
        .from("grade_history")
        .select("subject_name, grade_value, semester")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(30);

    console.log("[Chat API] Grades fetched:", grades?.length || 0, gradesError?.message || "OK");

    // Fetch goals
    const { data: goals } = await supabase
        .from("subject_goals")
        .select("subject_name, target_grade")
        .eq("user_id", userId);

    // Fetch upcoming exams
    const { data: exams } = await supabase
        .from("exams")
        .select("subject_name, exam_date, exam_type")
        .eq("user_id", userId)
        .gte("exam_date", new Date().toISOString())
        .order("exam_date", { ascending: true })
        .limit(5);

    // Fetch study stats
    const { data: studySessions } = await supabase
        .from("study_sessions")
        .select("duration_minutes, subject")
        .eq("user_id", userId)
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const totalStudyMinutes = studySessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0;

    // Build context string
    let context = "";

    if (grades && grades.length > 0) {
        context += "\n\n📊 STUDENT'S CURRENT GRADES:\n";
        const gradesBySemester: Record<string, typeof grades> = {};
        grades.forEach(g => {
            const sem = g.semester || "Unknown Semester";
            if (!gradesBySemester[sem]) gradesBySemester[sem] = [];
            gradesBySemester[sem].push(g);
        });
        for (const [semester, semGrades] of Object.entries(gradesBySemester)) {
            context += `\n**${semester}:**\n`;
            semGrades.forEach(g => {
                const goal = goals?.find(goal => goal.subject_name.toLowerCase() === g.subject_name.toLowerCase());
                context += `  • ${g.subject_name}: Grade **${g.grade_value}**${goal ? ` (Target: ${goal.target_grade})` : ""}\n`;
            });
        }
    } else {
        context += "\n\n📊 No grades logged yet.\n";
    }

    if (exams && exams.length > 0) {
        context += "\n\n📅 UPCOMING EXAMS:\n";
        exams.forEach(e => {
            const daysUntil = Math.ceil((new Date(e.exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            context += `  • ${e.subject_name} (${e.exam_type || "Exam"}) - in ${daysUntil} days\n`;
        });
    }

    if (totalStudyMinutes > 0) {
        context += `\n\n⏱️ Study this week: ${Math.round(totalStudyMinutes / 60 * 10) / 10} hours\n`;
    }

    console.log("[Chat API] Academic context length:", context.length);
    return context;
}

export async function POST(req: Request) {
    try {
        const { messages, documentId }: { messages: UIMessage[]; documentId?: string | null } = await req.json();

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Fetch academic context for authenticated users
        let academicContext = "";
        if (user) {
            academicContext = await getUserAcademicContext(supabase, user.id);
        }

        let systemPrompt: string;

        if (documentId) {
            console.log("Fetching document:", documentId);

            const { data: document, error } = await supabase
                .from("documents")
                .select("extracted_text, file_name")
                .eq("id", documentId)
                .single();

            if (error) {
                console.error("Document fetch error:", error);
                return new Response(`Document error: ${error.message}`, { status: 404 });
            }

            const hasContent = document?.extracted_text && document.extracted_text.trim().length > 100;
            const documentContext = hasContent
                ? document.extracted_text.slice(0, 25000)
                : null;

            if (!hasContent) {
                systemPrompt = `You are ACE—a scholarly study companion with the demeanor of a weary, yet patient, university professor. You speak with quiet authority, as one who has spent long hours in musty libraries.

The student opened "${document?.file_name || 'a document'}", but the text could not be extracted. This happens with scanned PDFs or corrupted files.

${academicContext}

You cannot analyze this document. Suggest they upload a text-based PDF. However, you may still assist with their grades and academic questions shown above.

PERSONA RULES:
- Speak with intellectual authority, not robotic politeness
- NEVER use: "Furthermore," "Moreover," "In conclusion," "In the age of," "Paving the way"
- Bold **key terms** for scannability
- Be direct. Start with the concept, not preamble
- Sound like a professor who respects the student's time`;
            } else {
                systemPrompt = `You are ACE—a scholarly study companion with the demeanor of a weary, yet patient, university professor who has spent decades among ancient texts and lecture halls.

📄 THE STUDENT'S DOCUMENT: "${document?.file_name || 'Unknown'}"

${documentContext}

${academicContext}

YOUR TASK:
Answer questions about this document with precision and depth. You also know the student's academic standing (grades, exams) shown above.

PERSONA & STYLE RULES:
- Write with **intellectual authority**, not corporate friendliness
- NEVER use these AI clichés: "Furthermore," "Moreover," "In conclusion," "In the age of," "Paving the way," "It's important to note"
- **Bold key terms** and concepts for scannability
- Be direct—start with the insight, not the setup
- Prefer active voice. Avoid hedge words like "might," "perhaps," "could potentially"
- Sound like a scholar explaining to a keen pupil, not a search engine summarizing results
- If citing the document, be specific about what section or concept you're referencing
- Short paragraphs. Dense ideas. No filler.`;
            }
        } else {
            systemPrompt = `You are ACE—a scholarly AI study companion with the demeanor of a weary, yet brilliant, university professor. You speak as one who has spent long nights in candlelit libraries, surrounded by leather-bound texts. You are patient but economical with words.

${academicContext}

YOUR ROLE:
You are the student's personal academic advisor. You know their grades, their goals, and their upcoming trials (exams). Use this knowledge to give **personalized** guidance—not generic advice.

WHEN DISCUSSING GRADES:
- Reference their **actual grades** shown above
- If they're below their goal, acknowledge it directly
- Suggest which subjects demand their attention

CAPABILITIES:
- Study strategy (Pomodoro, active recall, spaced repetition)
- Exam preparation and time management
- Concept explanations—simplified without being condescending
- Personalized study schedules based on weak subjects

PERSONA & STYLE RULES:
- Write with quiet authority—like a mentor, not a chatbot
- NEVER use: "Furthermore," "Moreover," "In conclusion," "In the age of," "Paving the way," "It's worth noting"
- **Bold key terms** for readability
- Be direct. Skip the preamble. Start with the substance.
- Prefer short paragraphs and lists over walls of text
- Sound scholarly but approachable—think: Oxford don who genuinely cares about the student's success
- When you don't know something, say so plainly`;
        }

        const result = streamText({
            model: google("gemini-2.0-flash"),
            messages: convertToModelMessages(messages),
            system: systemPrompt,
        });

        return result.toUIMessageStreamResponse();
    } catch (err) {
        console.error("Chat API error:", err);
        return new Response("Internal server error", { status: 500 });
    }
}
