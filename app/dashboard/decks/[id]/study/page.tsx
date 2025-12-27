import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDeckById } from "@/lib/actions/deck";
import { StudyPlayer } from "@/components/study-player";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

interface StudyPageProps {
    params: Promise<{ id: string }>;
}

export default async function StudyPage({ params }: StudyPageProps) {
    const { id } = await params;
    const deck = await getDeckById(id);

    if (!deck) {
        notFound();
    }

    // Filter cards here if needed, but StudyPlayer handles client-side filtering for smooth UX
    // We pass all cards so the player can determine 'studyQueue' (e.g. including due cards)

    return (
        <div className="flex flex-col h-screen bg-cream-50">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4 bg-white">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Link
                    href={`/dashboard/decks/${id}`}
                    className="flex items-center gap-2 text-sm text-ace-blue/60 hover:text-ace-blue transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to {deck.title}
                </Link>
                <div className="ml-auto font-serif font-bold text-ace-blue">
                    Study Session
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 bg-cream-50/50">
                <StudyPlayer cards={deck.cards} deckId={deck.id} />
            </main>
        </div>
    );
}
