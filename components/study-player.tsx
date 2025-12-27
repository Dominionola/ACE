"use client";

import { useState, useEffect } from "react";
import { Card } from "@/lib/schemas/deck";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCw, CheckCircle, BrainCircuit } from "lucide-react";
import { updateCardProgress } from "@/lib/actions/card";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

interface StudyPlayerProps {
    cards: Card[];
    deckId: string;
}

export function StudyPlayer({ cards, deckId }: StudyPlayerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isSessionComplete, setIsSessionComplete] = useState(false);
    const [studyQueue, setStudyQueue] = useState<Card[]>([]);
    const router = useRouter();

    // Filter cards that are due
    useEffect(() => {
        const now = new Date();
        const due = cards.filter(card => {
            if (!card.next_review) return true; // New cards are due
            return new Date(card.next_review) <= now;
        });

        // If no cards due, maybe offer to study ahead? For now, just show due or all if new deck.
        // Actually, let's just use the passed cards if the server has already filtered them?
        // Let's assume the page passes ALL cards, so we filter here.
        // Or better, let's just study the passed cards.
        setStudyQueue(due.length > 0 ? due : cards);
    }, [cards]);

    const currentCard = studyQueue[currentIndex];

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleRate = async (quality: number) => {
        if (!currentCard) return;

        // Optimistic update: move to next card immediately
        const nextIndex = currentIndex + 1;

        // Server action
        await updateCardProgress(currentCard.id, quality);

        setIsFlipped(false);

        if (nextIndex >= studyQueue.length) {
            setIsSessionComplete(true);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            router.refresh();
        } else {
            setCurrentIndex(nextIndex);
        }
    };

    if (cards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <BrainCircuit className="h-16 w-16 text-ace-blue/20 mb-4" />
                <h2 className="text-2xl font-serif text-ace-blue mb-2">No Cards Found</h2>
                <p className="text-ace-blue/60 mb-6">Add some cards to this deck to start studying.</p>
                <Link href={`/dashboard/decks/${deckId}`}>
                    <Button className="rounded-full">Back to Deck</Button>
                </Link>
            </div>
        );
    }

    if (isSessionComplete) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-fade-in-up">
                <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-serif text-ace-blue mb-2">Session Complete!</h2>
                <p className="text-ace-blue/60 mb-8 max-w-md">
                    Great job! You've reviewed all queued cards for now. Come back later for more spaced repetition.
                </p>
                <Link href={`/dashboard/decks/${deckId}`}>
                    <Button size="lg" className="rounded-full px-8 bg-ace-blue hover:bg-ace-light text-white">
                        Return to Deck
                    </Button>
                </Link>
            </div>
        );
    }

    if (!currentCard) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="max-w-3xl mx-auto w-full">
            {/* Progress Header */}
            <div className="flex items-center justify-between mb-6 text-sm text-ace-blue/60">
                <span>Card {currentIndex + 1} of {studyQueue.length}</span>
                <span>{Math.round(((currentIndex) / studyQueue.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-ace-blue/5 h-2 rounded-full mb-8 overflow-hidden">
                <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${((currentIndex) / studyQueue.length) * 100}%` }}
                />
            </div>

            {/* Flashcard Area */}
            <div className="relative aspect-[3/2] w-full perspective-1000 mb-8">
                <motion.div
                    className="w-full h-full relative preserve-3d cursor-pointer"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                    onClick={handleFlip}
                    style={{ transformStyle: "preserve-3d" }}
                >
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden bg-white border border-ace-blue/10 rounded-3xl shadow-lg flex flex-col items-center justify-center p-8 text-center hover:shadow-xl transition-shadow">
                        <span className="absolute top-6 left-6 text-xs font-bold text-ace-blue/30 uppercase tracking-widest">
                            Question
                        </span>
                        <p className="text-2xl md:text-3xl font-serif text-ace-blue">
                            {currentCard.front_content}
                        </p>
                        <p className="absolute bottom-6 text-sm text-ace-blue/40 flex items-center gap-2">
                            <RotateCw className="h-4 w-4" /> Click to flip
                        </p>
                    </div>

                    {/* Back */}
                    <div
                        className="absolute inset-0 backface-hidden bg-cream-50 border border-ace-blue/10 rounded-3xl shadow-lg flex flex-col items-center justify-center p-8 text-center rotate-y-180"
                        style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
                    >
                        <span className="absolute top-6 left-6 text-xs font-bold text-ace-blue/30 uppercase tracking-widest">
                            Answer
                        </span>
                        <p className="text-xl md:text-2xl font-sans text-ace-blue/90 leading-relaxed">
                            {currentCard.back_content}
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Controls */}
            <AnimatePresence mode="wait">
                {!isFlipped ? (
                    <motion.div
                        key="flip-btn"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex justify-center"
                    >
                        <Button
                            size="lg"
                            onClick={handleFlip}
                            className="rounded-full px-12 h-14 text-lg bg-ace-blue text-white hover:bg-ace-light shadow-lg hover:shadow-xl transition-all"
                        >
                            Show Answer
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="rating-btns"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-4 gap-4"
                    >
                        <div className="flex flex-col gap-2">
                            <Button
                                variant="outline"
                                className="h-14 border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 rounded-xl"
                                onClick={(e) => { e.stopPropagation(); handleRate(1); }}
                            >
                                Again
                            </Button>
                            <span className="text-xs text-center text-rose-400 font-medium">1m</span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button
                                variant="outline"
                                className="h-14 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800 rounded-xl"
                                onClick={(e) => { e.stopPropagation(); handleRate(3); }}
                            >
                                Hard
                            </Button>
                            <span className="text-xs text-center text-orange-400 font-medium">2d</span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button
                                variant="outline"
                                className="h-14 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 rounded-xl"
                                onClick={(e) => { e.stopPropagation(); handleRate(4); }}
                            >
                                Good
                            </Button>
                            <span className="text-xs text-center text-blue-400 font-medium">3d</span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button
                                variant="outline"
                                className="h-14 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 rounded-xl"
                                onClick={(e) => { e.stopPropagation(); handleRate(5); }}
                            >
                                Easy
                            </Button>
                            <span className="text-xs text-center text-green-400 font-medium">4d</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
