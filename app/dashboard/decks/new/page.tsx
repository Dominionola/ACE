"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { createDeck } from "@/lib/actions/deck";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NewDeckPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await createDeck(formData);

        if (result.success && result.deckId) {
            router.push(`/dashboard/decks/${result.deckId}`);
        } else {
            setError(result.error || "Failed to create deck");
            setIsLoading(false);
        }
    }

    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard/decks">Decks</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="font-serif text-lg">New Deck</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </header>

            <main className="flex-1 p-6 max-w-2xl">
                <Link
                    href="/dashboard/decks"
                    className="inline-flex items-center gap-2 text-ace-blue/60 hover:text-ace-blue transition-colors mb-8"
                >
                    <ArrowLeft strokeWidth={1.5} className="h-4 w-4" />
                    Back to Decks
                </Link>

                <div className="mb-8">
                    <h1 className="font-serif text-3xl text-ace-blue mb-2">Create New Deck</h1>
                    <p className="font-sans text-ace-blue/60">
                        A deck is a collection of flashcards organized around a topic or subject.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="title"
                            className="block font-sans text-sm font-medium text-ace-blue mb-2"
                        >
                            Title <span className="text-red-500">*</span>
                        </label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="e.g., Biology 101, French Vocabulary"
                            required
                            className="rounded-xl border-ace-blue/20 focus:border-ace-blue focus:ring-ace-blue"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="description"
                            className="block font-sans text-sm font-medium text-ace-blue mb-2"
                        >
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            placeholder="What will you study with this deck?"
                            className="w-full px-4 py-3 rounded-xl border border-ace-blue/20 focus:border-ace-blue focus:ring-1 focus:ring-ace-blue outline-none resize-none font-sans text-ace-blue placeholder:text-ace-blue/40"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="tags"
                            className="block font-sans text-sm font-medium text-ace-blue mb-2"
                        >
                            Tags
                        </label>
                        <Input
                            id="tags"
                            name="tags"
                            placeholder="biology, science, exam (comma-separated)"
                            className="rounded-xl border-ace-blue/20 focus:border-ace-blue focus:ring-ace-blue"
                        />
                        <p className="mt-1 text-xs text-ace-blue/40">
                            Separate tags with commas
                        </p>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-3 bg-ace-blue text-white rounded-full font-medium hover:bg-ace-light transition-all shadow-lg hover:shadow-xl"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Deck"
                            )}
                        </Button>
                        <Link
                            href="/dashboard/decks"
                            className="px-8 py-3 text-ace-blue hover:text-ace-light transition-colors"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </main>
        </>
    );
}
