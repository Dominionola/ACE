"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// ============================================
// Schemas
// ============================================

const LoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const SignupSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    fullName: z.string().min(2, "Name must be at least 2 characters"),
});

// ============================================
// Login
// ============================================

interface AuthResult {
    success: boolean;
    error?: string;
}

export async function login(formData: FormData): Promise<AuthResult> {
    const supabase = await createClient();

    const rawData = {
        email: formData.get("email"),
        password: formData.get("password"),
    };

    const result = LoginSchema.safeParse(rawData);

    if (!result.success) {
        return { success: false, error: result.error.issues[0]?.message };
    }

    const { error } = await supabase.auth.signInWithPassword({
        email: result.data.email,
        password: result.data.password,
    });

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/", "layout");
    return { success: true };
}

// ============================================
// Signup
// ============================================

export async function signup(formData: FormData): Promise<AuthResult> {
    try {
        const supabase = await createClient();

        const rawData = {
            email: formData.get("email"),
            password: formData.get("password"),
            fullName: formData.get("fullName"),
        };

        const result = SignupSchema.safeParse(rawData);

        if (!result.success) {
            return { success: false, error: result.error.issues[0]?.message };
        }

        // Ensure we have a valid base URL for the redirect
        let baseUrl = 'http://localhost:3000';
        if (process.env.NEXT_PUBLIC_BASE_URL) {
            baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        } else if (process.env.VERCEL_URL) {
            baseUrl = `https://${process.env.VERCEL_URL}`;
        }

        const { error } = await supabase.auth.signUp({
            email: result.data.email,
            password: result.data.password,
            options: {
                data: {
                    full_name: result.data.fullName,
                },
                emailRedirectTo: `${baseUrl}/auth/callback`,
            },
        });

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        console.error("Signup error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred during signup"
        };
    }
}

// ============================================
// Logout
// ============================================

export async function logout(): Promise<void> {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/login");
}

// ============================================
// Get Current User
// ============================================

export async function getCurrentUser() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    return user;
}

// ============================================
// Update Profile
// ============================================

const UpdateProfileSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
});

export async function updateProfile(data: { fullName: string }): Promise<AuthResult> {
    const supabase = await createClient();

    const result = UpdateProfileSchema.safeParse(data);
    if (!result.success) {
        return { success: false, error: result.error.issues[0]?.message };
    }

    const { error } = await supabase.auth.updateUser({
        data: { full_name: result.data.fullName },
    });

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/settings/profile");
    return { success: true };
}

