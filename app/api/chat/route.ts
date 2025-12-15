import { createClient } from "@/lib/supabase/server";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages, documentId } = await req.json();

    const supabase = await createClient(); // Await the promise

    // 1. Fetch document content
    const { data: document } = await supabase
        .from("documents")
        .select("extracted_text")
        .eq("id", documentId)
        .single();

    if (!document?.extracted_text) {
        return new Response("Document not found or has no text", { status: 404 });
    }

    // 2. Stream response with context
    const result = streamText({
        model: openai("gpt-4o"),
        messages,
        system: `You are an intelligent study companion. 
    Answer the user's questions based ONLY on the provided context below.
    If the answer is not in the context, say you don't know.
    
    Context:
    ${document.extracted_text.slice(0, 30000)} // Truncate to avoid context limit issues for now`,
    });

    return result.toDataStreamResponse();
}
