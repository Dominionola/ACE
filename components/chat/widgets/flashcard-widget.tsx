"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCw, GraduationCap, LayoutGrid, Layers } from "lucide-react";
import { motion } from "framer-motion";

interface Flashcard {
    front: string;
    back: string;
}

interface FlashcardWidgetProps {
    topic: string;
    cards: Flashcard[];
}

export function FlashcardWidget({ topic, cards }: FlashcardWidgetProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [viewMode, setViewMode] = useState<"carousel" | "grid">("carousel");
    const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % cards.length);
        }, 150);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
        }, 150);
    };

    const toggleCardFlip = (index: number) => {
        setFlippedCards((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const currentCard = cards[currentIndex];

    if (cards.length === 0) {
        return (
            <div className="w-full my-2 p-4 text-center text-ace-blue/50">
                No flashcards available.
            </div>
        );
    }
    return (
        <div className="w-full my-2">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2 text-ace-blue/70">
                    <GraduationCap className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">{topic || "Flashcards"}</span>
                    <span className="text-xs font-mono text-ace-blue/40 ml-2">
                        {cards.length} cards
                    </span>
                </div>
                <div className="flex items-center gap-1 bg-cream-100 rounded-full p-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode("carousel")}
                        className={`h-7 px-2 rounded-full text-xs ${viewMode === "carousel" ? "bg-white shadow-sm text-ace-blue" : "text-ace-blue/50"}`}
                    >
                        <Layers className="h-3.5 w-3.5 mr-1" />
                        Cards
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className={`h-7 px-2 rounded-full text-xs ${viewMode === "grid" ? "bg-white shadow-sm text-ace-blue" : "text-ace-blue/50"}`}
                    >
                        <LayoutGrid className="h-3.5 w-3.5 mr-1" />
                        Grid
                    </Button>
                </div>
            </div>

            {viewMode === "carousel" ? (
                <>
                    {/* Carousel View */}
                    <div className="relative h-48 w-full max-w-sm mx-auto perspective-1000 group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                        <motion.div
                            className="w-full h-full relative preserve-3d transition-all duration-500"
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            {/* Front */}
                            <div className="absolute inset-0 backface-hidden bg-white border border-ace-blue/10 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center p-6 text-center">
                                <p className="text-ace-blue font-serif text-lg font-medium leading-relaxed">
                                    {currentCard.front}
                                </p>
                                <p className="absolute bottom-4 text-xs text-ace-blue/30 font-sans mt-2">
                                    Tap to flip
                                </p>
                            </div>

                            {/* Back */}
                            <div
                                className="absolute inset-0 backface-hidden bg-gradient-to-br from-ace-blue to-ace-light text-white rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center p-6 text-center"
                                style={{ transform: "rotateY(180deg)" }}
                            >
                                <p className="font-medium text-base leading-relaxed">
                                    {currentCard.back}
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Carousel Controls */}
                    <div className="flex items-center justify-between mt-4 px-2 max-w-sm mx-auto">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                            disabled={cards.length <= 1}
                            className="h-8 w-8 text-ace-blue/50 hover:text-ace-blue hover:bg-ace-blue/5 rounded-full"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>

                        <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-ace-blue/40">
                                {currentIndex + 1} / {cards.length}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); setIsFlipped(!isFlipped); }}
                                className="text-xs text-ace-blue/60 gap-1.5 h-8 rounded-full hover:bg-ace-blue/5"
                            >
                                <RotateCw className="h-3.5 w-3.5" />
                                Flip
                            </Button>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            disabled={cards.length <= 1}
                            className="h-8 w-8 text-ace-blue/50 hover:text-ace-blue hover:bg-ace-blue/5 rounded-full"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                </>
            ) : (
                /* Grid View */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                    {cards.map((card, index) => (
                        <div
                            key={index}
                            onClick={() => toggleCardFlip(index)}
                            className={`cursor-pointer p-4 rounded-xl border transition-all duration-300 min-h-[100px] ${flippedCards.has(index)
                                ? "bg-gradient-to-br from-ace-blue to-ace-light text-white border-transparent"
                                : "bg-white border-ace-blue/10 hover:border-ace-blue/30 hover:shadow-sm"
                                }`}
                        >
                            <div className="flex items-start gap-2 mb-2">
                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${flippedCards.has(index) ? "bg-white/20" : "bg-cream-100 text-ace-blue/50"
                                    }`}>
                                    {index + 1}
                                </span>
                                <span className={`text-[10px] uppercase tracking-wider ${flippedCards.has(index) ? "text-white/60" : "text-ace-blue/40"
                                    }`}>
                                    {flippedCards.has(index) ? "Answer" : "Question"}
                                </span>
                            </div>
                            <p className={`text-sm leading-relaxed ${flippedCards.has(index) ? "text-white" : "text-ace-blue"
                                }`}>
                                {flippedCards.has(index) ? card.back : card.front}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
