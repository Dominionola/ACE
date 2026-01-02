import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    // Validate environment variables before proceeding
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Missing Supabase environment variables");
        // Allow request to continue without auth - prevents middleware crash
        return NextResponse.next({ request });
    }

    // Skip auth check for public auth pages - no need to call Supabase API
    const isAuthRoute =
        request.nextUrl.pathname === "/login" ||
        request.nextUrl.pathname === "/signup";

    if (isAuthRoute) {
        return NextResponse.next({ request });
    }

    try {
        let supabaseResponse = NextResponse.next({
            request,
        });

        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        });

        // Refresh session if expired
        const {
            data: { user },
        } = await supabase.auth.getUser();

        // Protected routes - redirect to login if not authenticated
        const isProtectedRoute =
            request.nextUrl.pathname.startsWith("/dashboard");

        if (isProtectedRoute && !user) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }

        return supabaseResponse;
    } catch (error) {
        console.error("Middleware error:", error);
        // Allow request to continue on error - prevents 500 crashes
        return NextResponse.next({ request });
    }
}
