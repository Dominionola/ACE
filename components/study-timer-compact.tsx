"use client";

import { useTimer } from "@/contexts/timer-context";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";

export function StudyTimerCompact() {
    const {
        mode,
        minutes,
        seconds,
        isRunning,
        sessions,
        progress,
        toggleTimer,
        resetTimer,
        skipToNext,
    } = useTimer();

    return (
        <div
            className={`rounded-2xl p-4 transition-all duration-500 ${mode === "focus"
                ? "bg-gradient-to-br from-ace-blue to-ace-light"
                : "bg-gradient-to-br from-green-600 to-green-500"
                }`}
        >
            <div className="flex items-center gap-4">
                {/* Timer Circle (compact) */}
                <div className="relative w-20 h-20">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="40"
                            cy="40"
                            r="36"
                            fill="none"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="4"
                        />
                        <circle
                            cx="40"
                            cy="40"
                            r="36"
                            fill="none"
                            stroke="white"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 36}
                            strokeDashoffset={2 * Math.PI * 36 * (1 - progress / 100)}
                            className="transition-all duration-1000"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-white font-mono">
                            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                        </span>
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 text-white mb-1">
                        {mode === "focus" ? (
                            <>
                                <Brain className="h-4 w-4" />
                                <span className="font-medium">Focus Time</span>
                            </>
                        ) : (
                            <>
                                <Coffee className="h-4 w-4" />
                                <span className="font-medium">Break Time</span>
                            </>
                        )}
                    </div>
                    <span className="text-sm text-white/70">
                        {sessions} session{sessions !== 1 ? 's' : ''} completed
                    </span>                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={resetTimer}
                        className="text-white hover:bg-white/20 rounded-full h-10 w-10"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>

                    <Button
                        onClick={toggleTimer}
                        className={`rounded-full h-12 w-12 ${isRunning
                            ? "bg-white/20 hover:bg-white/30"
                            : "bg-white text-ace-blue hover:bg-white/90"
                            }`}
                    >
                        {isRunning ? (
                            <Pause className="h-5 w-5" />
                        ) : (
                            <Play className="h-5 w-5 ml-0.5" />
                        )}
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={skipToNext}
                        className="text-white hover:bg-white/20 rounded-full h-10 w-10"
                        title={mode === "focus" ? "Skip to break" : "Skip to focus"}
                    >
                        {mode === "focus" ? (
                            <Coffee className="h-4 w-4" />
                        ) : (
                            <Brain className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Session Progress */}
            <div className="mt-3 flex justify-center gap-1">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${i < (sessions % 4) ? "bg-white" : "bg-white/30"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
