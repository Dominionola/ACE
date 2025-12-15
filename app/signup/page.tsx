"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { signup } from "@/lib/actions/auth";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await signup(formData);

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.error || "Signup failed");
        }
        setIsLoading(false);
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md text-center">
                    <div className="bg-green-50 p-8 rounded-3xl border border-green-200">
                        <h2 className="font-serif text-2xl text-green-800 mb-2">Check your email!</h2>
                        <p className="font-sans text-green-700">
                            We've sent you a confirmation link. Please check your inbox to verify your account.
                        </p>
                        <Link
                            href="/login"
                            className="inline-block mt-6 px-6 py-3 bg-ace-blue text-white rounded-full font-medium hover:bg-ace-light transition-all"
                        >
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <Logo className="h-12 w-12 mx-auto" />
                    </Link>
                    <h1 className="font-serif text-3xl text-ace-blue mt-4">Create your account</h1>
                    <p className="font-sans text-ace-blue/60 mt-2">
                        Start mastering your studies today
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white p-8 rounded-3xl border border-ace-blue/10 shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="fullName"
                                className="block font-sans text-sm font-medium text-ace-blue mb-2"
                            >
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ace-blue/40" />
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    placeholder="John Doe"
                                    required
                                    className="pl-10 rounded-xl border-ace-blue/20"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block font-sans text-sm font-medium text-ace-blue mb-2"
                            >
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ace-blue/40" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@university.edu"
                                    required
                                    className="pl-10 rounded-xl border-ace-blue/20"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block font-sans text-sm font-medium text-ace-blue mb-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ace-blue/40" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="pl-10 rounded-xl border-ace-blue/20"
                                />
                            </div>
                            <p className="mt-1 text-xs text-ace-blue/40">Minimum 6 characters</p>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-ace-blue text-white rounded-full font-medium hover:bg-ace-light transition-all shadow-lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="font-sans text-sm text-ace-blue/60">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="text-ace-blue font-medium hover:text-ace-light transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
