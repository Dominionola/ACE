import { createClient } from "@/lib/supabase/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { convertToModelMessages, streamText, UIMessage } from "ai";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages, documentId }: { messages: UIMessage[]; documentId?: string | null } = await req.json();

        // Debug: Log API key presence (not the actual key!)
        console.log("API Key present:", !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);

        // If documentId is provided, fetch document context
        let systemPrompt: string;

        if (documentId) {
            const supabase = await createClient();
            console.log("Fetching document:", documentId);

            // Fetch document content
            const { data: document, error } = await supabase
                .from("documents")
                .select("extracted_text, file_name")
                .eq("id", documentId)
                .single();

            console.log("Document result:", { document, error });

            if (error) {
                console.error("Document fetch error:", error);
                return new Response(`Document error: ${error.message}`, { status: 404 });
            }

            // Allow chat even without extracted text, but inform the user
            const documentContext = document?.extracted_text
                ? document.extracted_text.slice(0, 30000)
                : "No text content was extracted from this document. The PDF may be image-based or corrupted.";

            systemPrompt = `You are an intelligent study companion helping a student understand their study materials.
Answer the user's questions based ONLY on the provided context below.
If the answer is not in the context, politely say you don't have that information in the document.
Be concise but thorough. Format your answers with markdown when helpful.
If asked for a summary or to verify reading, provide a concise summary (max 4 lines) of the beginning of the text to confirm access.

Context from the document:
${documentContext}`;
        } else {
            // General study tutor mode - no document context
            systemPrompt = `You are ACE, an intelligent AI study companion and tutor.
Help students with:
- Study techniques and strategies (Pomodoro, active recall, spaced repetition)
- Exam preparation tips and time management
- Motivation and focus advice
- Explaining learning concepts in simple terms
- Creating study plans and schedules

Be friendly, encouraging, and concise. Use markdown formatting when helpful.
If asked about specific subject content (like math problems or science concepts), provide helpful explanations.
Always encourage active learning and effective study habits.`;
        }

        // Stream response using Gemini
        const result = streamText({
            model: google("gemini-2.5-flash-lite"),
            messages: convertToModelMessages(messages),
            system: systemPrompt,
        });

        return result.toUIMessageStreamResponse();
    } catch (err) {
        console.error("Chat API error:", err);
        return new Response("Internal server error", { status: 500 });
    }
}
