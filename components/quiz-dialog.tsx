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
import { Sparkles, Loader2, CheckCircle, XCircle, Trophy, ArrowRight } from "lucide-react";
import { generateQuiz, saveQuizResult, analyzeQuizPerformance } from "@/lib/actions/quiz";
import { Quiz } from "@/lib/schemas/quiz";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

interface QuizDialogProps {
    documentId: string;
    deckId: string;
    trigger?: React.ReactNode;
}

export function QuizDialog({ documentId, deckId, trigger }: QuizDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [quizData, setQuizData] = useState<Quiz | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
    const [quizComplete, setQuizComplete] = useState(false);
    const [score, setScore] = useState(0);
    const [analysis, setAnalysis] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Config State
    const [questionCount, setQuestionCount] = useState(5);
    const [topic, setTopic] = useState("");

    const { toast } = useToast();
    const router = useRouter();

    const handleGenerate = async () => {
        setIsLoading(true);
        const result = await generateQuiz(documentId, { questionCount, topic: topic || undefined });
        setIsLoading(false);

        if (result.success && result.quiz) {
            setQuizData(result.quiz);
            setSelectedAnswers(new Array(result.quiz.length).fill(-1));
        } else {
            toast({
                title: "Generation Failed",
                description: result.error || "Could not generate quiz.",
                variant: "destructive",
            });
        }
    };

    const handleOptionSelect = (optionIndex: number) => {
        const newAnswers = [...selectedAnswers];
        newAnswers[currentQuestionIndex] = optionIndex;
        setSelectedAnswers(newAnswers);
    };

    const handleNext = () => {
        if (!quizData) return;
        if (currentQuestionIndex < quizData.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = async () => {
        if (!quizData) return;
        setQuizComplete(true);

        // Calculate Score
        let correctCount = 0;
        const analysisInput = quizData.map((q, i) => {
            const isCorrect = q.correctAnswer === selectedAnswers[i];
            if (isCorrect) correctCount++;
            return {
                question: q.question,
                selectedOption: q.options[selectedAnswers[i]],
                correctOption: q.options[q.correctAnswer],
                isCorrect,
            };
        });

        setScore(correctCount);

        // Effects
        if (correctCount / quizData.length > 0.7) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
            });
        }

        // Save Result
        await saveQuizResult({
            deck_id: deckId,
            score: correctCount,
            total_questions: quizData.length,
        });

        router.refresh();

        // Analyze
        setIsAnalyzing(true);
        const analysisResult = await analyzeQuizPerformance({ questions: analysisInput });
        setIsAnalyzing(false);

        if (analysisResult.success) {
            setAnalysis(analysisResult.report);
        }
    };

    const resetQuiz = () => {
        setQuizData(null);
        setCurrentQuestionIndex(0);
        setSelectedAnswers([]);
        setQuizComplete(false);
        setScore(0);
        setAnalysis(null);
        setQuestionCount(5);
        setTopic("");
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetQuiz();
        }}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="gap-2 border-ace-blue/20 text-ace-blue hover:bg-ace-blue/5">
                        <Sparkles className="h-4 w-4" />
                        Generate Quiz
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-serif text-2xl text-ace-blue">
                        {quizComplete ? "Quiz Results" : quizData ? "Quiz Time" : "Generate Quiz"}
                    </DialogTitle>
                    <DialogDescription>
                        {quizComplete
                            ? "Review your performance and AI analysis."
                            : quizData
                                ? `Question ${currentQuestionIndex + 1} of ${quizData.length}`
                                : "Create a custom quiz from this document using AI."}
                    </DialogDescription>
                </DialogHeader>

                {!quizData ? (
                    <div className="flex flex-col items-center py-6 text-center space-y-6">
                        <div className="p-4 bg-ace-blue/5 rounded-full mb-2">
                            <Sparkles className="h-8 w-8 text-ace-blue" />
                        </div>

                        <div className="w-full max-w-sm space-y-4 text-left">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-ace-blue">Number of Questions</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[5, 10, 15].map((count) => (
                                        <button
                                            key={count}
                                            onClick={() => setQuestionCount(count)}
                                            className={cn(
                                                "py-2 rounded-lg text-sm border transition-all",
                                                questionCount === count
                                                    ? "bg-ace-blue text-white border-ace-blue"
                                                    : "bg-white text-ace-blue/60 border-border hover:border-ace-blue/40"
                                            )}
                                        >
                                            {count} qs
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-ace-blue">Focus Topic (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Chapter 4, Photosynthesis..."
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Leave blank to test the entire document.
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full max-w-sm rounded-full bg-ace-blue text-white hover:bg-ace-light h-11"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating Quiz...
                                </>
                            ) : (
                                "Start Quiz"
                            )}
                        </Button>
                    </div>
                ) : !quizComplete ? (
                    <div className="py-4 space-y-6">
                        {/* Progress Bar */}
                        <div className="w-full bg-ace-blue/5 h-2 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-ace-blue"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentQuestionIndex + 1) / quizData.length) * 100}%` }}
                            />
                        </div>

                        {/* Question */}
                        <div className="space-y-4 min-h-[300px]">
                            <h3 className="text-xl font-medium text-ace-blue leading-relaxed">
                                {quizData[currentQuestionIndex].question}
                            </h3>

                            <div className="grid gap-3">
                                {quizData[currentQuestionIndex].options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(idx)}
                                        className={cn(
                                            "w-full text-left p-4 rounded-xl border transition-all duration-200",
                                            selectedAnswers[currentQuestionIndex] === idx
                                                ? "border-ace-blue bg-ace-blue/5 shadow-md"
                                                : "border-border hover:border-ace-blue/40 hover:bg-slate-50"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors",
                                                selectedAnswers[currentQuestionIndex] === idx
                                                    ? "border-ace-blue bg-ace-blue text-white"
                                                    : "border-slate-300 text-slate-400"
                                            )}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className="text-sm text-ace-blue/80">{option}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                onClick={handleNext}
                                disabled={selectedAnswers[currentQuestionIndex] === -1}
                                className="rounded-full px-8 bg-ace-blue hover:bg-ace-light text-white"
                            >
                                {currentQuestionIndex === quizData.length - 1 ? "Finish" : "Next Question"}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <div className="py-4 space-y-6">
                        {/* Score Section */}
                        <div className="flex items-center justify-between p-6 bg-cream-50 rounded-2xl border border-ace-blue/10">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                                    <Trophy className="h-8 w-8 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-ace-blue/60 font-medium uppercase tracking-wider">Final Score</p>
                                    <p className="text-3xl font-serif text-ace-blue">
                                        {score} <span className="text-lg text-ace-blue/40">/ {quizData.length}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-ace-blue">{Math.round((score / quizData.length) * 100)}%</p>
                            </div>
                        </div>

                        {/* Analysis Section */}
                        {isAnalyzing ? (
                            <div className="flex flex-col items-center justify-center py-8 text-ace-blue/60">
                                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                                <p className="text-sm">Analyzing your performance...</p>
                            </div>
                        ) : analysis ? (
                            <div className="space-y-4 animate-fade-in-up">
                                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-sm">
                                    <p className="font-bold text-blue-900 mb-1">💡 Study Tip</p>
                                    <p className="text-blue-800">{analysis.recommendation}</p>
                                </div>

                                {analysis.keyWeakness && (
                                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-sm">
                                        <p className="font-bold text-rose-900 mb-1">🎯 Focus Area</p>
                                        <p className="text-rose-800">Review concepts related to: <strong>{analysis.keyWeakness}</strong></p>
                                    </div>
                                )}

                                <p className="text-center italic text-ace-blue/60 text-sm mt-4">
                                    "{analysis.motivation}"
                                </p>
                            </div>
                        ) : null}

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={resetQuiz}
                                className="rounded-full"
                            >
                                Close
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
