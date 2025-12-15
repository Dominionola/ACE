import { createClient } from "@/lib/supabase/server";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages, documentId } = await req.json();

    const supabase = await createClient();

    // 1. Fetch document content
    const { data: document } = await supabase
        .from("documents")
        .select("extracted_text")
        .eq("id", documentId)
        .single();

    if (!document?.extracted_text) {
        return new Response("Document not found or has no text", { status: 404 });
    }

    // 2. Stream response with context using Gemini
    const result = streamText({
        model: google("gemini-1.5-flash"),
        messages,
        system: `You are an intelligent study companion. 
    Answer the user's questions based ONLY on the provided context below.
    If the answer is not in the context, say you don't know.
    Be concise but thorough. Format your answers with markdown when helpful.
    
    Context:
    ${document.extracted_text.slice(0, 30000)}`,
    });

    return result.toTextStreamResponse();
}

