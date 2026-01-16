import Link from "next/link";
import { Plus, Library, Sparkles } from "lucide-react";
import { getDecksGroupedBySemester } from "@/lib/actions/deck";
import { DeckFolder } from "@/components/deck-folder";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default async function DecksPage() {
    const groupedDecks = await getDecksGroupedBySemester();
    const totalDecks = groupedDecks.reduce((sum, g) => sum + g.decks.length, 0);

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
                            {totalDecks} {totalDecks === 1 ? "deck" : "decks"} in {groupedDecks.length} {groupedDecks.length === 1 ? "folder" : "folders"}
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

                {/* Deck Folders */}
                {totalDecks === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="p-4 bg-ace-blue/5 rounded-full mb-6">
                            <Library strokeWidth={1.5} className="h-12 w-12 text-ace-blue/40" />
                        </div>
                        <h2 className="font-serif text-2xl text-ace-blue mb-2">No decks yet</h2>
                        <p className="font-sans text-ace-blue/60 mb-6 max-w-md">
                            Create your first study deck to start organizing your learning materials.
                            Or add grades in the Grades section to auto-generate decks!
                        </p>
                        <div className="flex gap-3">
                            <Link
                                href="/dashboard/decks/new"
                                className="px-6 py-3 bg-ace-blue text-white rounded-full font-medium hover:bg-ace-light transition-all shadow-lg flex items-center gap-2"
                            >
                                <Plus strokeWidth={1.5} className="h-5 w-5" />
                                Create Your First Deck
                            </Link>
                            <Link
                                href="/dashboard/grades"
                                className="px-6 py-3 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600 transition-all shadow-lg flex items-center gap-2"
                            >
                                <Sparkles strokeWidth={1.5} className="h-5 w-5" />
                                Import Grades
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {groupedDecks.map((group, index) => (
                            <DeckFolder
                                key={group.semester}
                                semester={group.semester}
                                decks={group.decks}
                                defaultOpen={index === 0} // First folder open by default
                            />
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}
