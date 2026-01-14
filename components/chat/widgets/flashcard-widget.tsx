"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCw, Copy, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

    const currentCard = cards[currentIndex];

    return (
        <div className="w-full max-w-sm mx-auto my-2">
            {/* Header */}
            <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2 text-ace-blue/70">
                    <GraduationCap className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">{topic || "Flashcards"}</span>
                </div>
                <span className="text-xs font-mono text-ace-blue/40">
                    {currentIndex + 1} / {cards.length}
                </span>
            </div>

            {/* Card Container */}
            <div className="relative h-48 w-full perspective-1000 group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
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

            {/* Controls */}
            <div className="flex items-center justify-between mt-4 px-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    disabled={cards.length <= 1}
                    className="h-8 w-8 text-ace-blue/50 hover:text-ace-blue hover:bg-ace-blue/5 rounded-full"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); setIsFlipped(!isFlipped); }}
                    className="text-xs text-ace-blue/60 gap-1.5 h-8 rounded-full hover:bg-ace-blue/5"
                >
                    <RotateCw className="h-3.5 w-3.5" />
                    Flip Card
                </Button>

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
        </div>
    );
}
