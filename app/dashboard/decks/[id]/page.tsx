import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, BookOpen, FileText, Trash2 } from "lucide-react";
import { getDeckById } from "@/lib/actions/deck";
import { getDocumentsForDeck } from "@/lib/actions/document";
import { FileUpload } from "@/components/file-upload";
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

interface DeckDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function DeckDetailPage({ params }: DeckDetailPageProps) {
    const { id } = await params;
    const deck = await getDeckById(id);

    if (!deck) {
        notFound();
    }

    const documents = await getDocumentsForDeck(id);

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
                            <BreadcrumbPage className="font-serif text-lg">{deck.title}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </header>

            <main className="flex-1 p-6">
                <Link
                    href="/dashboard/decks"
                    className="inline-flex items-center gap-2 text-ace-blue/60 hover:text-ace-blue transition-colors mb-6"
                >
                    <ArrowLeft strokeWidth={1.5} className="h-4 w-4" />
                    Back to Decks
                </Link>

                {/* Deck Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="font-serif text-3xl text-ace-blue mb-2">{deck.title}</h1>
                        {deck.description && (
                            <p className="font-sans text-ace-blue/60 max-w-2xl">{deck.description}</p>
                        )}
                        {deck.tags.length > 0 && (
                            <div className="flex gap-2 mt-3">
                                {deck.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 bg-ace-blue/5 text-ace-blue text-sm rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <button className="px-6 py-3 bg-ace-blue text-white rounded-full font-medium hover:bg-ace-light transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                        <Plus strokeWidth={1.5} className="h-5 w-5" />
                        Add Card
                    </button>
                </div>

                {/* Study Materials Section */}
                <div className="mb-10">
                    <h2 className="font-serif text-xl text-ace-blue mb-4">Study Materials</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Upload Zone */}
                        <FileUpload deckId={id} />

                        {/* Documents List */}
                        <div className="space-y-3">
                            {documents.length === 0 ? (
                                <div className="p-6 bg-ace-blue/5 rounded-2xl text-center">
                                    <FileText strokeWidth={1.5} className="h-8 w-8 text-ace-blue/30 mx-auto mb-2" />
                                    <p className="font-sans text-sm text-ace-blue/50">
                                        No documents yet. Upload a PDF to get started.
                                    </p>
                                </div>
                            ) : (
                                documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center gap-3 p-4 bg-white rounded-xl border border-ace-blue/10 hover:shadow-md transition-shadow"
                                    >
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <FileText strokeWidth={1.5} className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-sans text-sm text-ace-blue font-medium truncate">
                                                {doc.file_name}
                                            </p>
                                            <p className="font-sans text-xs text-ace-blue/50">
                                                {doc.extracted_text
                                                    ? `${doc.extracted_text.length} characters extracted`
                                                    : "Processing..."}
                                            </p>
                                        </div>
                                        <a
                                            href={doc.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1 text-xs text-ace-blue hover:text-ace-light transition-colors"
                                        >
                                            View
                                        </a>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Cards Section */}
                <h2 className="font-serif text-xl text-ace-blue mb-4">Flashcards</h2>
                {deck.cards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-ace-blue/10">
                        <div className="p-4 bg-ace-blue/5 rounded-full mb-6">
                            <BookOpen strokeWidth={1.5} className="h-10 w-10 text-ace-blue/40" />
                        </div>
                        <h3 className="font-serif text-xl text-ace-blue mb-2">No cards yet</h3>
                        <p className="font-sans text-ace-blue/60 mb-6 max-w-md">
                            Add flashcards to this deck to start studying.
                        </p>
                        <button className="px-6 py-3 bg-ace-blue text-white rounded-full font-medium hover:bg-ace-light transition-all shadow-lg flex items-center gap-2">
                            <Plus strokeWidth={1.5} className="h-5 w-5" />
                            Add Your First Card
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {deck.cards.map((card, index) => (
                            <div
                                key={card.id}
                                className="bg-white p-6 rounded-2xl border border-ace-blue/10 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <span className="text-xs font-bold text-ace-blue/40 uppercase tracking-wide mb-2">
                                        Card {index + 1}
                                    </span>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs font-bold text-ace-blue/40 uppercase tracking-wide mb-1">
                                            Front
                                        </p>
                                        <p className="font-sans text-ace-blue">{card.front_content}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-ace-blue/40 uppercase tracking-wide mb-1">
                                            Back
                                        </p>
                                        <p className="font-sans text-ace-blue/80">{card.back_content}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}

