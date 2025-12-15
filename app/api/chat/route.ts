import { createClient } from "@/lib/supabase/server";
import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText, UIMessage } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages, documentId }: { messages: UIMessage[]; documentId?: string } = await req.json();

        if (!documentId) {
            return new Response("Document ID is required", { status: 400 });
        }

        const supabase = await createClient();

        console.log("Fetching document:", documentId);

        // 1. Fetch document content
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

        // 2. Stream response with context using Gemini
        const result = streamText({
            model: google("gemini-1.5-flash"),
            messages: convertToModelMessages(messages),
            system: `You are an intelligent study companion helping a student understand their study materials.
Answer the user's questions based ONLY on the provided context below.
If the answer is not in the context, politely say you don't have that information in the document.
Be concise but thorough. Format your answers with markdown when helpful.

Context from the document:
${documentContext}`,
        });

        return result.toUIMessageStreamResponse();
    } catch (err) {
        console.error("Chat API error:", err);
        return new Response("Internal server error", { status: 500 });
    }
}
