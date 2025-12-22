"use client";

import { useState } from "react";
import { type Deck } from "@/lib/schemas/deck";
import { cloneDeck } from "@/lib/actions/explore";
import { Button } from "@/components/ui/button";
import { Copy, Loader2, Check, FileText, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface PublicDeckCardProps {
    deck: Deck;
}

export function PublicDeckCard({ deck }: PublicDeckCardProps) {
    const [isCloning, setIsCloning] = useState(false);
    const [cloned, setCloned] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleClone = async () => {
        setIsCloning(true);
        const result = await cloneDeck(deck.id);

        if (result.success && result.newDeckId) {
            setCloned(true);
            toast({
                title: "Deck Cloned!",
                description: "The deck has been added to your library.",
            });
            // Optionally redirect to the new deck
            // router.push(`/dashboard/decks/${result.newDeckId}`);
        } else {
            toast({
                title: "Clone Failed",
                description: result.error || "Something went wrong.",
                variant: "destructive",
            });
        }
        setIsCloning(false);
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-ace-blue/10 shadow-sm hover:shadow-lg transition-all duration-300 group">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <h3 className="font-serif text-xl font-semibold text-ace-blue line-clamp-2 group-hover:text-ace-accent transition-colors">
                    {deck.title}
                </h3>
            </div>

            {/* Description */}
            {deck.description && (
                <p className="text-ace-blue/60 text-sm mb-4 line-clamp-2">
                    {deck.description}
                </p>
            )}

            {/* Tags */}
            {deck.tags && deck.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {deck.tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-0.5 bg-ace-blue/5 text-ace-blue text-xs rounded-full flex items-center gap-1"
                        >
                            <Tag className="h-3 w-3" />
                            {tag}
                        </span>
                    ))}
                    {deck.tags.length > 3 && (
                        <span className="text-xs text-ace-blue/40">+{deck.tags.length - 3} more</span>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-ace-blue/5">
                <div className="flex items-center gap-1 text-ace-blue/40 text-xs">
                    <FileText className="h-3.5 w-3.5" />
                    <span>Public Deck</span>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full gap-2 text-ace-blue hover:bg-ace-blue hover:text-white"
                    onClick={handleClone}
                    disabled={isCloning || cloned}
                >
                    {cloned ? (
                        <>
                            <Check className="h-4 w-4" />
                            Cloned
                        </>
                    ) : isCloning ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Cloning...
                        </>
                    ) : (
                        <>
                            <Copy className="h-4 w-4" />
                            Clone to Library
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
