"use client";

import Link from "next/link";
import { Library, Plus, MoreHorizontal, Trash2 } from "lucide-react";
import type { Deck } from "@/lib/schemas/deck";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface DeckCardProps {
    deck: Deck;
    onDelete?: (id: string) => void;
}

export function DeckCard({ deck, onDelete }: DeckCardProps) {
    const cardCount = 0; // Will be updated when cards are implemented

    return (
        <div className="group bg-white p-6 rounded-3xl border border-ace-blue/10 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-2xl text-ace-blue">
                    <Library strokeWidth={1.5} className="h-6 w-6" />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                        >
                            <MoreHorizontal strokeWidth={1.5} className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem
                            onClick={() => onDelete?.(deck.id)}
                            className="text-red-600 focus:text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Link href={`/dashboard/decks/${deck.id}`} className="block">
                <h3 className="font-serif text-xl text-ace-blue mb-2 group-hover:text-ace-light transition-colors">
                    {deck.title}
                </h3>
                {deck.description && (
                    <p className="font-sans text-sm text-ace-blue/60 line-clamp-2 mb-4">
                        {deck.description}
                    </p>
                )}
                <div className="flex items-center justify-between">
                    <span className="font-sans text-xs text-ace-blue/40 uppercase tracking-wide">
                        {cardCount} cards
                    </span>
                    {deck.tags.length > 0 && (
                        <div className="flex gap-1">
                            {deck.tags.slice(0, 2).map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2 py-0.5 bg-ace-blue/5 text-ace-blue text-xs rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </Link>
        </div>
    );
}
