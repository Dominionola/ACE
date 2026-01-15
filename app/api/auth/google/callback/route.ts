import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, getGoogleUserEmail } from "@/lib/google-drive";
import { createClient } from "@/lib/supabase/server";

// GET /api/auth/google/callback - Handle OAuth callback from Google
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // Contains user ID
    const error = searchParams.get("error");

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const settingsUrl = `${baseUrl}/dashboard/settings/integrations`;

    // Handle OAuth errors
    if (error) {
        console.error("Google OAuth error:", error);
        return NextResponse.redirect(`${settingsUrl}?error=oauth_denied`);
    }

    if (!code) {
        return NextResponse.redirect(`${settingsUrl}?error=no_code`);
    }

    try {
        // Verify user is authenticated
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.redirect(`${baseUrl}/login`);
        }

        // Verify state matches user ID (security check)
        if (!state || state !== user.id) {
            console.error("State missing or mismatch - possible CSRF attack");
            return NextResponse.redirect(`${settingsUrl}?error=state_mismatch`);
        }
        // Exchange code for tokens
        const tokenResult = await exchangeCodeForTokens(code);

        if (!tokenResult.success || !tokenResult.tokens) {
            return NextResponse.redirect(`${settingsUrl}?error=token_exchange_failed`);
        }

        const { access_token, refresh_token, expiry_date, scope } = tokenResult.tokens;

        // Get user's Google email
        const googleEmail = access_token ? await getGoogleUserEmail(access_token) : null;

        // Store tokens in database
        const { error: upsertError } = await supabase
            .from("google_tokens")
            .upsert({
                user_id: user.id,
                access_token: access_token || "",
                refresh_token: refresh_token || null,
                expires_at: expiry_date ? new Date(expiry_date).toISOString() : null,
                scope: scope || null,
                google_email: googleEmail,
            }, {
                onConflict: "user_id",
            });

        if (upsertError) {
            console.error("Error saving tokens:", upsertError);
            return NextResponse.redirect(`${settingsUrl}?error=save_failed`);
        }

        // Success - redirect back to settings
        return NextResponse.redirect(`${settingsUrl}?success=connected`);

    } catch (err) {
        console.error("OAuth callback error:", err);
        return NextResponse.redirect(`${settingsUrl}?error=unknown`);
    }
}
