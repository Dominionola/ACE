import { NextResponse } from "next/server";
import { disconnectGoogleDrive } from "@/lib/actions/google-drive";

// POST /api/auth/google/disconnect - Disconnect Google Drive
export async function POST() {
    try {
        const result = await disconnectGoogleDrive();

        if (result.success) {
            return NextResponse.redirect(
                new URL("/dashboard/settings/integrations?success=disconnected",
                    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000")
            );
        } else {
            return NextResponse.redirect(
                new URL("/dashboard/settings/integrations?error=disconnect_failed",
                    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000")
            );
        }
    } catch (error) {
        console.error("Disconnect error:", error);
        return NextResponse.redirect(
            new URL("/dashboard/settings/integrations?error=unknown",
                process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000")
        );
    }
}
