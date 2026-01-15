"use client";

import { useState } from "react";
import { Card } from "@/lib/schemas/deck";
import { Tag, Filter, ChevronDown } from "lucide-react";
import { CardTagSelector } from "@/components/card-tag-selector";
import { useRouter } from "next/navigation";

interface CardListWithTagsProps {
    cards: Card[];
    deckId: string;
}

// Get unique tags from cards
function getUniqueTags(cards: Card[]): string[] {
    const tags = cards
        .map(c => (c as Card & { tag?: string }).tag)
        .filter((tag): tag is string => Boolean(tag));
    return [...new Set(tags)].sort();
}

// Group cards by tag
function groupCardsByTag(cards: Card[]) {
    const groups: Record<string, Card[]> = {};
    const untagged: Card[] = [];

    for (const card of cards) {
        const tag = (card as Card & { tag?: string }).tag;
        if (tag) {
            if (!groups[tag]) {
                groups[tag] = [];
            }
            groups[tag].push(card);
        } else {
            untagged.push(card);
        }
    }

    return { groups, untagged };
}

export function CardListWithTags({ cards, deckId }: CardListWithTagsProps) {
    const [filterTag, setFilterTag] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"list" | "grouped">("list");
    const router = useRouter();

    const existingTags = getUniqueTags(cards);
    const { groups, untagged } = groupCardsByTag(cards);

    // Filter cards
    const filteredCards = filterTag
        ? cards.filter(c => (c as Card & { tag?: string }).tag === filterTag)
        : cards;

    const handleTagUpdated = () => {
        router.refresh();
    };

    return (
        <div className="space-y-4">
            {/* Controls */}
            {existingTags.length > 0 && (
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-sm text-ace-blue/60">
                        <Filter className="h-4 w-4" />
                        <span>Filter:</span>
                    </div>
                    <button
                        onClick={() => setFilterTag(null)}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${filterTag === null
                                ? "bg-ace-blue text-white"
                                : "bg-cream-100 text-ace-blue/70 hover:bg-cream-200"
                            }`}
                    >
                        All ({cards.length})
                    </button>
                    {existingTags.map((tag) => {
                        const count = cards.filter(c => (c as Card & { tag?: string }).tag === tag).length;
                        return (
                            <button
                                key={tag}
                                onClick={() => setFilterTag(tag)}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${filterTag === tag
                                        ? "bg-ace-blue text-white"
                                        : "bg-cream-100 text-ace-blue/70 hover:bg-cream-200"
                                    }`}
                            >
                                {tag} ({count})
                            </button>
                        );
                    })}
                    {untagged.length > 0 && (
                        <button
                            onClick={() => setFilterTag("__untagged__")}
                            className={`px-3 py-1 text-xs rounded-full transition-colors ${filterTag === "__untagged__"
                                    ? "bg-ace-blue text-white"
                                    : "bg-cream-100 text-ace-blue/70 hover:bg-cream-200"
                                }`}
                        >
                            Untagged ({untagged.length})
                        </button>
                    )}
                </div>
            )}

            {/* Cards */}
            <div className="grid gap-4">
                {(filterTag === "__untagged__" ? untagged : filteredCards).map((card, index) => (
                    <div
                        key={card.id}
                        className="bg-white p-6 rounded-2xl border border-ace-blue/10 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <span className="text-xs font-bold text-ace-blue/40 uppercase tracking-wide">
                                Card {index + 1}
                            </span>
                            <CardTagSelector
                                cardId={card.id}
                                currentTag={(card as Card & { tag?: string }).tag}
                                existingTags={existingTags}
                                onTagUpdated={handleTagUpdated}
                            />
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

            {filteredCards.length === 0 && (
                <div className="text-center py-8 text-ace-blue/50">
                    No cards match the selected filter.
                </div>
            )}
        </div>
    );
}
