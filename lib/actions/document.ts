"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { InsertDocumentSchema, type Document } from "@/lib/schemas/document";

// ============================================
// Upload Document
// ============================================

interface UploadDocumentResult {
    success: boolean;
    error?: string;
    documentId?: string;
}

export async function uploadDocument(
    deckId: string,
    formData: FormData
): Promise<UploadDocumentResult> {
    const supabase = await createClient();

    // Get authenticated user
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, error: "You must be logged in to upload documents" };
    }

    // Verify user owns the deck
    const { data: deck, error: deckError } = await supabase
        .from("decks")
        .select("id")
        .eq("id", deckId)
        .eq("user_id", user.id)
        .single();

    if (deckError || !deck) {
        return { success: false, error: "Deck not found or unauthorized" };
    }

    // Get file from form data
    const file = formData.get("file") as File | null;

    if (!file) {
        return { success: false, error: "No file provided" };
    }

    // Validate file type
    if (file.type !== "application/pdf") {
        return { success: false, error: "Only PDF files are supported" };
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        return { success: false, error: "File size must be less than 10MB" };
    }

    // Generate unique file path
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${deckId}/${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (uploadError) {
        console.error("Upload error:", uploadError);
        return { success: false, error: "Failed to upload file" };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(fileName);

    // Extract text from PDF (basic implementation)
    let extractedText = "";
    try {
        // Note: pdf-parse requires Buffer, which works in Node.js environment
        const pdfParse = (await import("pdf-parse")).default;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;
    } catch (parseError) {
        console.error("PDF parse error:", parseError);
        // Continue without extracted text - not a critical error
    }

    // Insert document record
    const documentData = {
        deck_id: deckId,
        file_name: file.name,
        file_url: urlData.publicUrl,
        extracted_text: extractedText || null,
    };

    const result = InsertDocumentSchema.safeParse(documentData);
    if (!result.success) {
        return { success: false, error: "Invalid document data" };
    }

    const { data: doc, error: insertError } = await supabase
        .from("documents")
        .insert(documentData)
        .select("id")
        .single();

    if (insertError) {
        console.error("Insert error:", insertError);
        return { success: false, error: "Failed to save document record" };
    }

    revalidatePath(`/dashboard/decks/${deckId}`);
    return { success: true, documentId: doc.id };
}

// ============================================
// Get Documents for Deck
// ============================================

export async function getDocumentsForDeck(deckId: string): Promise<Document[]> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    // Verify ownership via deck
    const { data: deck } = await supabase
        .from("decks")
        .select("id")
        .eq("id", deckId)
        .eq("user_id", user.id)
        .single();

    if (!deck) {
        return [];
    }

    const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("deck_id", deckId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching documents:", error);
        return [];
    }

    return data || [];
}

// ============================================
// Delete Document
// ============================================

export async function deleteDocument(
    documentId: string,
    deckId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    // Get document to find file path
    const { data: doc, error: fetchError } = await supabase
        .from("documents")
        .select("file_url")
        .eq("id", documentId)
        .single();

    if (fetchError || !doc) {
        return { success: false, error: "Document not found" };
    }

    // Delete from database
    const { error: deleteError } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentId);

    if (deleteError) {
        return { success: false, error: deleteError.message };
    }

    // Try to delete from storage (extract path from URL)
    try {
        const url = new URL(doc.file_url);
        const pathParts = url.pathname.split("/storage/v1/object/public/documents/");
        if (pathParts[1]) {
            await supabase.storage.from("documents").remove([pathParts[1]]);
        }
    } catch {
        // Non-critical - file might not exist
    }

    revalidatePath(`/dashboard/decks/${deckId}`);
    return { success: true };
}
