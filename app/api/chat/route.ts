import { createClient } from "@/lib/supabase/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { convertToModelMessages, streamText, UIMessage, tool } from "ai";
import { z } from "zod";

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

            // Check if document has actual content
            const hasContent = document?.extracted_text && document.extracted_text.trim().length > 100;
            const documentContext = hasContent
                ? document.extracted_text.slice(0, 30000)
                : null;

            if (!hasContent) {
                systemPrompt = `You are an intelligent study companion. The user has opened a document called "${document?.file_name || 'Unknown'}" but unfortunately NO TEXT could be extracted from it.

This usually happens because:
1. The PDF contains scanned images instead of text (needs OCR)
2. The PDF is password-protected or corrupted
3. The file upload failed

IMPORTANT RULES:
- Tell the user that the document appears to be empty or image-based
- DO NOT generate quizzes, flashcards, or summaries since there's no content
- Suggest they try uploading a different PDF with selectable text
- You can still answer general study questions, but make it clear you cannot see their document

Be helpful and apologetic about the limitation.`;
            } else {
                systemPrompt = `You are an intelligent study companion helping a student understand their study materials.
Answer the user's questions based ONLY on the provided context below.
If the answer is not in the context, politely say you don't have that information in the document.
Be concise but thorough. Format your answers with markdown when helpful.
If asked for a summary or to verify reading, provide a concise summary (max 4 lines) of the beginning of the text to confirm access.

Context from the document "${document?.file_name || 'Unknown'}":
${documentContext}`;
            }
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
If asked for a specific subject content (like math problems or science concepts), provide helpful explanations.
Always encourage active learning and effective study habits.

If the user provides a document or text (like a resume or essay) and asks for help, analyze it and provide feedback.`;
        }

        // Stream response using Gemini
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
