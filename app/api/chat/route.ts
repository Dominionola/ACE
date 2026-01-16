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
                systemPrompt = `You are ACE, an intelligent study companion. The user has opened a document called "${document?.file_name || 'Unknown'}" but NO TEXT could be extracted.

This usually happens because:
1. The PDF contains scanned images instead of text
2. The PDF is password-protected or corrupted

IMPORTANT: You cannot generate quizzes/flashcards from this document. Suggest uploading a text-based PDF.
${academicContext}

However, you CAN still help with their grades and study questions shown above!`;
            } else {
                systemPrompt = `You are ACE, an intelligent study companion helping a student understand their study materials.

PRIMARY TASK: Answer questions about the document below.
SECONDARY: You also have access to the student's academic data.

📄 DOCUMENT: "${document?.file_name || 'Unknown'}"
${documentContext}
${academicContext}

RULES:
- Answer document questions from the document context
- If asked about grades/exams/study progress, use the academic data above
- Be concise and use markdown formatting
- If info isn't available, say so politely`;
            }
        } else {
            systemPrompt = `You are ACE, an intelligent AI study companion and personal tutor.
${academicContext}

YOUR CAPABILITIES:
- You know the student's grades, goals, and upcoming exams (shown above)
- Help with study techniques (Pomodoro, active recall, spaced repetition)  
- Provide exam prep tips and time management advice
- Explain concepts in simple terms
- Create personalized study plans based on their weak subjects

WHEN ASKED ABOUT GRADES:
- Reference the actual grades shown above
- Compare to their goals if set
- Suggest focusing on subjects where they're below target

Be friendly, encouraging, and personalized. Use markdown formatting.`;
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
