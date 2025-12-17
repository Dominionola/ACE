"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Brain, CheckCircle, Loader2, XCircle } from "lucide-react";
import { generateQuiz, saveQuizResult } from "@/lib/actions/quiz";
import type { Quiz } from "@/lib/schemas/quiz";

interface QuizDialogProps {
    documentId: string;
    deckId: string;
}

export function QuizDialog({ documentId, deckId }: QuizDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<"idle" | "loading" | "playing" | "finished">("idle");
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [userAnswers, setUserAnswers] = useState<number[]>([]);
    const [score, setScore] = useState(0);
    const [error, setError] = useState("");

    const handleGenerate = async () => {
        setStatus("loading");
        setError("");
        const result = await generateQuiz(documentId);

        if (result.success && result.quiz) {
            setQuiz(result.quiz);
            setStatus("playing");
            setCurrentQuestion(0);
            setUserAnswers([]);
            setScore(0);
        } else {
            setError(result.error || "Failed to generate quiz");
            setStatus("idle");
        }
    };

    const handleAnswer = (optionIndex: number) => {
        const newAnswers = [...userAnswers];
        newAnswers[currentQuestion] = optionIndex;
        setUserAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestion < (quiz?.length || 0) - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = async () => {
        if (!quiz) return;

        // Calculate score
        let calculatedScore = 0;
        quiz.forEach((q, idx) => {
            if (userAnswers[idx] === q.correctAnswer) {
                calculatedScore++;
            }
        });
        setScore(calculatedScore);
        setStatus("finished");

        // Save result
        await saveQuizResult({
            deck_id: deckId,
            score: calculatedScore,
            total_questions: quiz.length,
        });
    };

    const resetQuiz = () => {
        setStatus("idle");
        setQuiz(null);
        setUserAnswers([]);
        setCurrentQuestion(0);
        setScore(0);
    };

    if (!documentId) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetQuiz();
        }}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Brain className="h-4 w-4" />
                    Take Quiz
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                {status === "idle" && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Generate Quiz</DialogTitle>
                            <DialogDescription>
                                Create a 5-question multiple choice quiz based on this document.
                            </DialogDescription>
                        </DialogHeader>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <DialogFooter>
                            <Button onClick={handleGenerate}>Generate & Start</Button>
                        </DialogFooter>
                    </>
                )}

                {status === "loading" && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Analyzing document and generating questions...</p>
                    </div>
                )}

                {status === "playing" && quiz && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Question {currentQuestion + 1} of {quiz.length}</DialogTitle>
                        </DialogHeader>

                        <div className="py-4 space-y-4">
                            <p className="font-medium text-lg">{quiz[currentQuestion].question}</p>

                            <div className="space-y-2">
                                {quiz[currentQuestion].options.map((option, idx) => (
                                    <Button
                                        key={idx}
                                        variant={userAnswers[currentQuestion] === idx ? "default" : "outline"}
                                        className="w-full justify-start h-auto py-3 px-4 text-left whitespace-normal"
                                        onClick={() => handleAnswer(idx)}
                                    >
                                        <div className="flex items-center w-full">
                                            <span className="mr-3 h-6 w-6 flex-shrink-0 flex items-center justify-center rounded-full border text-xs">
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            {option}
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                                disabled={currentQuestion === 0}
                            >
                                Previous
                            </Button>
                            <Button
                                onClick={handleNext}
                                className="ml-auto"
                                // Only require an answer to proceed if it's the last question? 
                                // Or let them skip? User asked to change answers, implies they might want to skip back.
                                // Let's keep it simple: can go back anytime. Can go next if answered (or maybe allow skip? Nah, let's stick to answered for now to ensure completion).
                                disabled={userAnswers[currentQuestion] === undefined}
                            >
                                {currentQuestion === quiz.length - 1 ? "Finish & Submit" : "Next Question"}
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {status === "finished" && quiz && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Quiz Results</DialogTitle>
                            <DialogDescription>
                                You scored {score} out of {quiz.length}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                            {quiz.map((q, idx) => {
                                const isCorrect = userAnswers[idx] === q.correctAnswer;
                                return (
                                    <div key={idx} className="border rounded-lg p-3 text-sm">
                                        <p className="font-medium mb-2">{idx + 1}. {q.question}</p>
                                        <div className="space-y-1">
                                            <div className={cn("flex items-center gap-2",
                                                userAnswers[idx] === q.correctAnswer ? "text-green-600 font-medium" : "text-red-500"
                                            )}>
                                                {isCorrect ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                                Your Answer: {q.options[userAnswers[idx]]}
                                            </div>
                                            {!isCorrect && (
                                                <div className="text-muted-foreground ml-6">
                                                    Correct Answer: {q.options[q.correctAnswer]}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <DialogFooter>
                            <Button onClick={() => setIsOpen(false)}>Close</Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

function cn(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}
