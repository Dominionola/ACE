import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/google-drive";
import { createClient } from "@/lib/supabase/server";

// GET /api/auth/google - Redirect to Google OAuth consent screen
export async function GET() {
    try {
        // Verify user is authenticated
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
        }

        // Generate OAuth URL with user ID as state for verification
        const authUrl = getGoogleAuthUrl(user.id);

        return NextResponse.redirect(authUrl);
    } catch (error) {
        console.error("Google OAuth initiation error:", error);
        return NextResponse.json({ error: "Failed to initiate OAuth" }, { status: 500 });
    }
}
