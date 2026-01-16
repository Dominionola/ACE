"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
    listDrivePDFs,
    downloadDriveFile,
    getDriveFileMetadata,
    refreshAccessToken,
} from "@/lib/google-drive";

interface DriveFile {
    id: string;
    name: string;
    size?: string;
    modifiedTime?: string;
    webViewLink?: string;
    iconLink?: string;
}

// Check if user has connected Google Drive
export async function isGoogleDriveConnected(): Promise<{ connected: boolean; email?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { connected: false };
    }

    const { data } = await supabase
        .from("google_tokens")
        .select("google_email, expires_at")
        .eq("user_id", user.id)
        .single();

    if (!data) {
        return { connected: false };
    }

    return {
        connected: true,
        email: data.google_email || undefined,
    };
}

// Get valid access token (refresh if expired)
async function getValidAccessToken(userId: string): Promise<string | null> {
    const supabase = await createClient();

    const { data } = await supabase
        .from("google_tokens")
        .select("access_token, refresh_token, expires_at")
        .eq("user_id", userId)
        .single();

    if (!data) return null;

    // Check if token is expired
    const isExpired = data.expires_at && new Date(data.expires_at) < new Date();

    if (isExpired && data.refresh_token) {
        // Refresh the token
        const result = await refreshAccessToken(data.refresh_token);

        if (result.success && result.tokens?.access_token) {
            // Update stored token
            // Update stored token
            const { error: updateError } = await supabase
                .from("google_tokens")
                .update({
                    access_token: result.tokens.access_token,
                    expires_at: result.tokens.expiry_date
                        ? new Date(result.tokens.expiry_date).toISOString()
                        : null,
                })
                .eq("user_id", userId);

            if (updateError) {
                console.error("Failed to update access token:", updateError);
            }

            return result.tokens.access_token ?? null;
        }

        return null;
    }

    return data.access_token;
}

// List PDFs from user's Google Drive
export async function listGoogleDriveFiles(): Promise<{ success: boolean; files: DriveFile[]; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, files: [], error: "Not authenticated" };
    }

    const accessToken = await getValidAccessToken(user.id);

    if (!accessToken) {
        return { success: false, files: [], error: "Google Drive not connected or token expired" };
    }

    const result = await listDrivePDFs(accessToken);

    return {
        success: result.success,
        files: (result.files || []) as DriveFile[],
        error: result.error,
    };
}

// Import a file from Google Drive to a deck
export async function importFromGoogleDrive(
    fileId: string,
    deckId: string
): Promise<{ success: boolean; documentId?: string; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Verify user owns the deck
    const { data: deck } = await supabase
        .from("decks")
        .select("id")
        .eq("id", deckId)
        .eq("user_id", user.id)
        .single();

    if (!deck) {
        return { success: false, error: "Deck not found" };
    }

    const accessToken = await getValidAccessToken(user.id);

    if (!accessToken) {
        return { success: false, error: "Google Drive not connected" };
    }

    try {
        // Get file metadata
        const metadataResult = await getDriveFileMetadata(accessToken, fileId);
        if (!metadataResult.success || !metadataResult.file) {
            return { success: false, error: "Failed to get file info" };
        }

        const fileName = metadataResult.file.name || "Untitled.pdf";

        // Download file content
        const downloadResult = await downloadDriveFile(accessToken, fileId);
        if (!downloadResult.success || !downloadResult.content) {
            return { success: false, error: "Failed to download file" };
        }

        // Extract text from PDF
        let extractedText = "";
        try {
            const pdfParse = (await import("pdf-parse")).default;
            const pdfData = await pdfParse(downloadResult.content);
            extractedText = pdfData.text;
            console.log("PDF parsed successfully. Pages:", pdfData.numpages);
        } catch (parseError) {
            console.error("PDF parse error:", parseError);
            // Continue without extracted text
        }

        // Create document record (without storing the file - it stays in Drive)
        const { data: doc, error: insertError } = await supabase
            .from("documents")
            .insert({
                deck_id: deckId,
                file_name: fileName,
                file_url: `https://drive.google.com/file/d/${fileId}/view`, // Link to Drive file
                extracted_text: extractedText || null,
            })
            .select("id")
            .single();

        if (insertError) {
            console.error("Insert error:", insertError);
            return { success: false, error: "Failed to save document" };
        }

        revalidatePath(`/dashboard/decks/${deckId}`);
        return { success: true, documentId: doc.id };

    } catch (error) {
        console.error("Import error:", error);
        return { success: false, error: "Failed to import file" };
    }
}

// Disconnect Google Drive
export async function disconnectGoogleDrive(): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase
        .from("google_tokens")
        .delete()
        .eq("user_id", user.id);

    if (error) {
        return { success: false, error: "Failed to disconnect" };
    }

    revalidatePath("/dashboard/settings/integrations");
    return { success: true };
}
