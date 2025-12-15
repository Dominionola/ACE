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
        return { success: false, error: result.error.errors[0]?.message };
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
    const supabase = await createClient();

    const rawData = {
        email: formData.get("email"),
        password: formData.get("password"),
        fullName: formData.get("fullName"),
    };

    const result = SignupSchema.safeParse(rawData);

    if (!result.success) {
        return { success: false, error: result.error.errors[0]?.message };
    }

    const { error } = await supabase.auth.signUp({
        email: result.data.email,
        password: result.data.password,
        options: {
            data: {
                full_name: result.data.fullName,
            },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
        },
    });

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/", "layout");
    return { success: true };
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
