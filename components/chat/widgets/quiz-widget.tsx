"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Trophy, ArrowRight, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface Question {
    text: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

interface QuizWidgetProps {
    topic: string;
    questions: Question[];
}

export function QuizWidget({ topic, questions }: QuizWidgetProps) {
    if (!questions || questions.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-ace-blue/10 p-4 shadow-sm max-w-md w-full my-2 animate-pulse">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-ace-blue/10 rounded-full flex items-center justify-center">
                        <Brain className="h-4 w-4 text-ace-blue/50" />
                    </div>
                    <div className="space-y-2 flex-1">
                        <div className="h-4 bg-ace-blue/10 rounded w-1/3"></div>
                        <div className="h-3 bg-ace-blue/5 rounded w-2/3"></div>
                    </div>
                </div>
                <div className="mt-4 space-y-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-10 bg-ace-blue/5 rounded-xl w-full"></div>
                    ))}
                </div>
            </div>
        );
    }

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    const handleOptionSelect = (option: string) => {
        if (isAnswered) return;
        setSelectedOption(option);
    };

    const handleCheckAnswer = () => {
        if (!selectedOption) return;

        setIsAnswered(true);
        if (selectedOption === currentQuestion.correctAnswer) {
            setScore(prev => prev + 1);
            // Small confetti for correct answer
            confetti({
                particleCount: 30,
                spread: 30,
                origin: { y: 0.8 },
                colors: ['#3B82F6', '#60A5FA']
            });
        }
    };

    const handleNext = () => {
        if (isLastQuestion) {
            setIsCompleted(true);
            if (score + (selectedOption === currentQuestion.correctAnswer ? 0 : 0) >= questions.length / 2) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        }
    };

    if (isCompleted) {
        return (
            <div className="bg-white rounded-2xl border border-ace-blue/10 p-6 shadow-sm max-w-md w-full my-2">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Trophy className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-serif font-bold text-ace-blue">Quiz Complete!</h3>
                        <p className="text-ace-blue/60">You scored {score} out of {questions.length}</p>
                    </div>

                    <div className="w-full bg-ace-blue/5 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-ace-accent h-full rounded-full transition-all duration-1000"
                            style={{ width: `${(score / questions.length) * 100}%` }}
                        />
                    </div>

                    <div className="pt-2">
                        <p className="text-sm text-ace-blue/70 italic">
                            {score === questions.length ? "Perfect score! Outstanding work! 🌟" :
                                score >= questions.length / 2 ? "Good job! Keep practicing! 📚" :
                                    "Keep studying, you'll get it next time! 💪"}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-ace-blue/10 shadow-sm max-w-md w-full my-2 overflow-hidden mx-auto">
            {/* Header */}
            <div className="bg-ace-blue/5 p-4 flex items-center justify-between border-b border-ace-blue/5">
                <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-ace-accent" />
                    <span className="text-sm font-semibold text-ace-blue">{topic || "Quiz"}</span>
                </div>
                <span className="text-xs font-mono text-ace-blue/50">
                    {currentQuestionIndex + 1}/{questions.length}
                </span>
            </div>

            {/* Question */}
            <div className="p-5">
                <h4 className="font-medium text-ace-blue text-base mb-4 leading-relaxed">
                    {currentQuestion.text}
                </h4>

                <div className="space-y-2.5">
                    {currentQuestion.options.map((option, idx) => {
                        const isSelected = selectedOption === option;
                        const isCorrect = option === currentQuestion.correctAnswer;

                        let optionClass = "border-ace-blue/10 hover:bg-ace-blue/5 hover:border-ace-blue/20";

                        if (isAnswered) {
                            if (isCorrect) optionClass = "bg-green-50 border-green-200 text-green-800";
                            else if (isSelected && !isCorrect) optionClass = "bg-red-50 border-red-200 text-red-800";
                            else optionClass = "opacity-50 border-transparent";
                        } else if (isSelected) {
                            optionClass = "bg-ace-blue/5 border-ace-blue text-ace-blue ring-1 ring-ace-blue";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleOptionSelect(option)}
                                disabled={isAnswered}
                                className={cn(
                                    "w-full text-left p-3.5 rounded-xl text-sm border transition-all duration-200 flex items-center justify-between group",
                                    optionClass
                                )}
                            >
                                <span>{option}</span>
                                {isAnswered && isCorrect && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                {isAnswered && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-500" />}
                            </button>
                        );
                    })}
                </div>

                {isAnswered && (
                    <div className="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                        <p className="text-xs text-blue-800">
                            <span className="font-semibold">Explanation:</span> {currentQuestion.explanation}
                        </p>
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    {!isAnswered ? (
                        <Button
                            onClick={handleCheckAnswer}
                            disabled={!selectedOption}
                            className="bg-ace-blue hover:bg-ace-light text-white rounded-full px-6"
                        >
                            Check Answer
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            className="bg-ace-blue hover:bg-ace-light text-white rounded-full px-6 gap-2"
                        >
                            {isLastQuestion ? "Finish Quiz" : "Next Question"}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
