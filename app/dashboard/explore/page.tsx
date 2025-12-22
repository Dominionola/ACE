import { getPublicDecks } from "@/lib/actions/explore";
import { PublicDeckCard } from "./deck-card";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Globe, Search } from "lucide-react";

export default async function ExplorePage() {
    const publicDecks = await getPublicDecks();

    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage className="font-serif text-lg">Explore</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </header>

            <main className="flex-1 p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-ace-blue/10 rounded-full">
                            <Globe className="h-6 w-6 text-ace-blue" />
                        </div>
                        <h1 className="font-serif text-4xl text-ace-blue">
                            Explore <span className="italic">Public Decks</span>
                        </h1>
                    </div>
                    <p className="font-sans text-ace-blue/60">
                        Discover study materials shared by the community.
                    </p>
                </div>

                {/* Deck Grid */}
                {publicDecks.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {publicDecks.map((deck) => (
                            <PublicDeckCard key={deck.id} deck={deck} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📚</div>
                        <h2 className="font-serif text-2xl text-ace-blue mb-2">No Public Decks Yet</h2>
                        <p className="text-ace-blue/60">
                            Be the first to share your study materials with the community!
                        </p>
                    </div>
                )}
            </main>
        </>
    );
}
