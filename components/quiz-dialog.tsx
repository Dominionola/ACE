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
import { generateQuiz, saveQuizResult, analyzeQuizPerformance } from "@/lib/actions/quiz";
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

    // Analysis State
    const [analysis, setAnalysis] = useState<{ keyWeakness: string, recommendation: string, motivation: string } | null>(null);
    const [analyzing, setAnalyzing] = useState(false);

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
            setAnalysis(null);
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

        // Run Smart Analysis w/ Gemini
        setAnalyzing(true);
        const analysisInput = {
            questions: quiz.map((q, idx) => ({
                question: q.question,
                selectedOption: q.options[userAnswers[idx]],
                correctOption: q.options[q.correctAnswer],
                isCorrect: userAnswers[idx] === q.correctAnswer
            }))
        };

        const analysisRes = await analyzeQuizPerformance(analysisInput);
        if (analysisRes.success && analysisRes.report) {
            setAnalysis(analysisRes.report);
        }
        setAnalyzing(false);
    };

    const resetQuiz = () => {
        setStatus("idle");
        setQuiz(null);
        setUserAnswers([]);
        setCurrentQuestion(0);
        setScore(0);
        setAnalysis(null);
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

            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
                                        className="w-full justify-start h-auto py-3 px-4 text-left whitespace-normal leading-normal"
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

                        {/* Score Summary */}
                        <div className="p-4 bg-muted/30 rounded-lg text-center mb-4">
                            <p className="text-2xl font-bold mb-1">{Math.round((score / quiz.length) * 100)}%</p>
                            <p className="text-sm text-muted-foreground">{score >= quiz.length * 0.8 ? "Great job!" : "Keep practicing!"}</p>
                        </div>

                        {/* AI Analysis Card */}
                        {analyzing ? (
                            <div className="p-4 border rounded-xl bg-blue-50/50 flex items-center gap-3 animate-pulse">
                                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                <span className="text-sm text-blue-700 font-medium">Generating Smart Analysis...</span>
                            </div>
                        ) : analysis ? (
                            <div className="p-5 border border-blue-100 bg-blue-50/30 rounded-xl space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-blue-700 font-semibold">
                                    <Brain className="h-5 w-5" />
                                    <h3>AI Performance Report</h3>
                                </div>

                                <div className="grid gap-3 text-sm">
                                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                                        <span className="font-semibold text-gray-700 block mb-1">Observation:</span>
                                        {analysis.keyWeakness}
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                                        <span className="font-semibold text-gray-700 block mb-1">Recommendation:</span>
                                        {analysis.recommendation}
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-blue-100 italic text-blue-600">
                                        "{analysis.motivation}"
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        <div className="py-2 space-y-6">
                            {quiz.map((q, idx) => {
                                const isCorrect = userAnswers[idx] === q.correctAnswer;
                                return (
                                    <div key={idx} className="border-b last:border-0 pb-6">
                                        <p className="font-medium mb-3 text-base">{idx + 1}. {q.question}</p>

                                        <div className="space-y-2 mb-3">
                                            {q.options.map((opt, optIdx) => {
                                                let style = "border-transparent bg-muted/20 text-muted-foreground"; // default
                                                if (optIdx === q.correctAnswer) style = "border-green-200 bg-green-50 text-green-800 font-medium";
                                                if (userAnswers[idx] === optIdx && !isCorrect) style = "border-red-200 bg-red-50 text-red-800";

                                                return (
                                                    <div key={optIdx} className={cn("p-2 rounded-lg border text-sm flex items-start gap-2", style)}>
                                                        <span className="mt-0.5 min-w-[1.25rem]">{String.fromCharCode(65 + optIdx)}.</span>
                                                        <span>{opt}</span>
                                                        {optIdx === q.correctAnswer && <CheckCircle className="h-4 w-4 ml-auto text-green-600 shrink-0" />}
                                                        {userAnswers[idx] === optIdx && !isCorrect && <XCircle className="h-4 w-4 ml-auto text-red-500 shrink-0" />}
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        {/* Explanation / Grounding */}
                                        <div className="bg-cream-50 p-3 rounded-lg text-sm text-gray-700 flex gap-2 items-start">
                                            <span className="font-bold text-ace-blue shrink-0 text-xs uppercase tracking-wide mt-0.5">Explanation:</span>
                                            <span>{q.explanation}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <DialogFooter>
                            <Button onClick={() => setIsOpen(false)}>Close Evaluation</Button>
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
