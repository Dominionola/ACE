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
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { QuizPageContent } from "./quiz-content";

// Force dynamic rendering - this page requires user auth
export const dynamic = "force-dynamic";

interface QuizPageProps {
    searchParams: Promise<{ subject?: string }>;
}

export default async function QuizPage({ searchParams }: QuizPageProps) {
    const params = await searchParams;
    const subject = params.subject || "";

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Find decks that match the subject name (for exam prep)
    const { data: decks } = await supabase
        .from("decks")
        .select(`
      id,
      title,
      description,
      documents:documents(id, file_name, extracted_text)
    `)
        .eq("user_id", user.id)
        .ilike("title", `%${subject}%`)
        .limit(10);

    // Also look for decks where description matches
    const { data: descDecks } = await supabase
        .from("decks")
        .select(`
      id,
      title,
      description,
      documents:documents(id, file_name, extracted_text)
    `)
        .eq("user_id", user.id)
        .ilike("description", `%${subject}%`)
        .limit(10);

    // Merge and dedupe results
    const allDecks = [...(decks || []), ...(descDecks || [])];
    const uniqueDecks = allDecks.filter(
        (deck, index, self) => index === self.findIndex((d) => d.id === deck.id)
    );

    // Filter to only decks with documents that have extracted text
    const decksWithDocuments = uniqueDecks.filter(
        (deck) => deck.documents && deck.documents.length > 0 &&
            deck.documents.some((doc: { extracted_text: string | null }) => doc.extracted_text)
    );

    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="font-serif text-lg">Practice Quiz</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </header>

            <main className="flex-1 p-4 sm:p-6">
                <QuizPageContent
                    subject={subject}
                    decksWithDocuments={decksWithDocuments}
                />
            </main>
        </>
    );
}
