"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, ChevronRight, FileText, FolderOpen, AlertCircle } from "lucide-react";
import { generateQuiz, saveQuizResult, analyzeQuizPerformance } from "@/lib/actions/quiz";
import { Quiz } from "@/lib/schemas/quiz";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { Trophy, ArrowRight, CheckCircle, XCircle } from "lucide-react";

interface Document {
    id: string;
    file_name: string;
    extracted_text: string | null;
}

interface DeckWithDocs {
    id: string;
    title: string;
    description: string | null;
    documents: Document[];
}

interface QuizPageContentProps {
    subject: string;
    decksWithDocuments: DeckWithDocs[];
}

export function QuizPageContent({ subject, decksWithDocuments }: QuizPageContentProps) {
    const [selectedDeck, setSelectedDeck] = useState<DeckWithDocs | null>(null);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

    // Quiz State
    const [isLoading, setIsLoading] = useState(false);
    const [quizData, setQuizData] = useState<Quiz | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
    const [quizComplete, setQuizComplete] = useState(false);
    const [score, setScore] = useState(0);
    const [analysis, setAnalysis] = useState<{ keyWeakness?: string; recommendation?: string; motivation?: string } | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Config State
    const [questionCount, setQuestionCount] = useState(5);
    const [topic, setTopic] = useState("");

    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!selectedDocument || !selectedDeck) return;

        setIsLoading(true);
        const result = await generateQuiz(selectedDocument.id, { questionCount, topic: topic || undefined });
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
        if (!quizData || !selectedDeck) return;
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
            deck_id: selectedDeck.id,
            score: correctCount,
            total_questions: quizData.length,
        });

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
        setSelectedDocument(null);
        setSelectedDeck(null);
    };

    // No matching decks found
    if (decksWithDocuments.length === 0) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-white p-8 rounded-3xl border border-ace-blue/10 shadow-sm text-center">
                    <div className="p-4 bg-amber-50 rounded-full w-fit mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-amber-600" strokeWidth={1.5} />
                    </div>
                    <h1 className="font-serif text-2xl text-ace-blue mb-2">
                        No Study Materials Found
                    </h1>
                    <p className="text-ace-blue/60 mb-6">
                        {subject ? (
                            <>We couldn&apos;t find any decks matching &ldquo;<span className="font-medium">{subject}</span>&rdquo; with uploaded documents.</>
                        ) : (
                            "No subject was specified for this quiz."
                        )}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/dashboard/decks"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ace-blue text-white rounded-full font-medium hover:bg-ace-light transition-all"
                        >
                            <FolderOpen className="h-4 w-4" strokeWidth={1.5} />
                            Browse Decks
                        </Link>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-ace-blue/20 text-ace-blue rounded-full font-medium hover:bg-ace-blue/5 transition-all"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Quiz in progress
    if (quizData && !quizComplete) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ace-blue/10 shadow-sm">
                    <h2 className="font-serif text-2xl text-ace-blue mb-1">Quiz Time</h2>
                    <p className="text-ace-blue/60 text-sm mb-6">
                        Question {currentQuestionIndex + 1} of {quizData.length}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-ace-blue/5 h-2 rounded-full overflow-hidden mb-6">
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

                    <div className="flex justify-end mt-6">
                        <Button
                            onClick={handleNext}
                            disabled={selectedAnswers[currentQuestionIndex] === -1}
                            className="rounded-full px-8 bg-ace-blue hover:bg-ace-light text-white"
                        >
                            {currentQuestionIndex === quizData.length - 1 ? "Finish" : "Next Question"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Quiz complete - results
    if (quizComplete && quizData) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ace-blue/10 shadow-sm">
                    <h2 className="font-serif text-2xl text-ace-blue mb-6">Quiz Results</h2>

                    {/* Score Section */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 bg-cream-50 rounded-2xl border border-ace-blue/10 mb-6">
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
                                &ldquo;{analysis.motivation}&rdquo;
                            </p>
                        </div>
                    ) : null}

                    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                        <Button
                            onClick={resetQuiz}
                            className="rounded-full px-8 bg-ace-blue hover:bg-ace-light text-white"
                        >
                            Try Another Quiz
                        </Button>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center px-6 py-2 bg-transparent border border-ace-blue/20 text-ace-blue rounded-full font-medium hover:bg-ace-blue/5 transition-all"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Document selection or configuration
    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="font-serif text-2xl sm:text-3xl text-ace-blue mb-1">
                    Practice Quiz
                </h1>
                {subject && (
                    <p className="text-ace-blue/60">
                        Preparing quiz for: <span className="font-medium">{subject}</span>
                    </p>
                )}
            </div>

            {!selectedDeck ? (
                // Step 1: Select a deck
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ace-blue/10 shadow-sm">
                    <h2 className="font-serif text-xl text-ace-blue mb-4">Select a Deck</h2>
                    <p className="text-ace-blue/60 text-sm mb-6">
                        Choose a deck with study materials to generate your quiz.
                    </p>

                    <div className="space-y-3">
                        {decksWithDocuments.map((deck) => (
                            <button
                                key={deck.id}
                                onClick={() => setSelectedDeck(deck)}
                                className="w-full text-left p-4 rounded-2xl border border-ace-blue/10 hover:border-ace-blue/30 hover:shadow-md transition-all bg-cream-50/50 group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium text-ace-blue group-hover:text-ace-light transition-colors">
                                            {deck.title}
                                        </h3>
                                        {deck.description && (
                                            <p className="text-sm text-ace-blue/50 truncate max-w-md">
                                                {deck.description}
                                            </p>
                                        )}
                                        <p className="text-xs text-ace-blue/40 mt-1">
                                            {deck.documents.filter(d => d.extracted_text).length} document(s) available
                                        </p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-ace-blue/30 group-hover:text-ace-blue transition-colors" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            ) : !selectedDocument ? (
                // Step 2: Select a document
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ace-blue/10 shadow-sm">
                    <button
                        onClick={() => setSelectedDeck(null)}
                        className="text-sm text-ace-blue/60 hover:text-ace-blue mb-4 flex items-center gap-1"
                    >
                        ← Back to decks
                    </button>

                    <h2 className="font-serif text-xl text-ace-blue mb-4">Select a Document</h2>
                    <p className="text-ace-blue/60 text-sm mb-6">
                        Choose a document from <span className="font-medium">{selectedDeck.title}</span> to quiz on.
                    </p>

                    <div className="space-y-3">
                        {selectedDeck.documents
                            .filter((doc) => doc.extracted_text)
                            .map((doc) => (
                                <button
                                    key={doc.id}
                                    onClick={() => setSelectedDocument(doc)}
                                    className="w-full text-left p-4 rounded-2xl border border-ace-blue/10 hover:border-ace-blue/30 hover:shadow-md transition-all bg-cream-50/50 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-ace-blue/5 rounded-lg">
                                            <FileText className="h-5 w-5 text-ace-blue/60" strokeWidth={1.5} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-ace-blue group-hover:text-ace-light transition-colors truncate">
                                                {doc.file_name}
                                            </h3>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-ace-blue/30 group-hover:text-ace-blue transition-colors" />
                                    </div>
                                </button>
                            ))}
                    </div>
                </div>
            ) : (
                // Step 3: Configure and start quiz
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ace-blue/10 shadow-sm">
                    <button
                        onClick={() => setSelectedDocument(null)}
                        className="text-sm text-ace-blue/60 hover:text-ace-blue mb-4 flex items-center gap-1"
                    >
                        ← Back to documents
                    </button>

                    <div className="flex flex-col items-center py-6 text-center space-y-6">
                        <div className="p-4 bg-ace-blue/5 rounded-full mb-2">
                            <Sparkles className="h-8 w-8 text-ace-blue" />
                        </div>

                        <div>
                            <h2 className="font-serif text-xl text-ace-blue mb-1">Generate Quiz</h2>
                            <p className="text-ace-blue/60 text-sm">
                                From: <span className="font-medium">{selectedDocument.file_name}</span>
                            </p>
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
                </div>
            )}
        </div>
    );
}
