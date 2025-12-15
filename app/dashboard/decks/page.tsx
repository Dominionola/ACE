import Link from "next/link";
import { Plus, Library } from "lucide-react";
import { getDecks } from "@/lib/actions/deck";
import { DeckCard } from "@/components/deck-card";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default async function DecksPage() {
    const decks = await getDecks();

    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage className="font-serif text-lg">My Decks</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </header>

            <main className="flex-1 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-serif text-3xl text-ace-blue mb-1">My Decks</h1>
                        <p className="font-sans text-ace-blue/60">
                            {decks.length} {decks.length === 1 ? "deck" : "decks"} total
                        </p>
                    </div>
                    <Link
                        href="/dashboard/decks/new"
                        className="px-6 py-3 bg-ace-blue text-white rounded-full font-medium hover:bg-ace-light transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                        <Plus strokeWidth={1.5} className="h-5 w-5" />
                        Create Deck
                    </Link>
                </div>

                {/* Deck Grid */}
                {decks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="p-4 bg-ace-blue/5 rounded-full mb-6">
                            <Library strokeWidth={1.5} className="h-12 w-12 text-ace-blue/40" />
                        </div>
                        <h2 className="font-serif text-2xl text-ace-blue mb-2">No decks yet</h2>
                        <p className="font-sans text-ace-blue/60 mb-6 max-w-md">
                            Create your first study deck to start organizing your learning materials.
                        </p>
                        <Link
                            href="/dashboard/decks/new"
                            className="px-6 py-3 bg-ace-blue text-white rounded-full font-medium hover:bg-ace-light transition-all shadow-lg flex items-center gap-2"
                        >
                            <Plus strokeWidth={1.5} className="h-5 w-5" />
                            Create Your First Deck
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {decks.map((deck) => (
                            <DeckCard key={deck.id} deck={deck} />
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}
