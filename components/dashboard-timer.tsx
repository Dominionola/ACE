"use client";

import { useState } from "react";
import { useTimer } from "@/contexts/timer-context";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Coffee, Brain, Maximize2 } from "lucide-react";
import { FullscreenTimer } from "@/components/fullscreen-timer";

export function DashboardTimer() {
    const [isFullscreen, setIsFullscreen] = useState(false);
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
        <>
            <div
                className={`rounded-2xl p-4 transition-all duration-500 ${mode === "focus"
                    ? "bg-gradient-to-br from-ace-blue to-ace-light"
                    : "bg-gradient-to-br from-green-600 to-green-500"
                    }`}
            >
                <div className="flex items-center gap-4">
                    {/* Timer Circle (compact) */}
                    <div className="relative w-16 h-16 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="4"
                            />
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="white"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 28}
                                strokeDashoffset={2 * Math.PI * 28 * (1 - progress / 100)}
                                className="transition-all duration-1000"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-white font-mono">
                                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                            </span>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-white mb-0.5">
                            {mode === "focus" ? (
                                <>
                                    <Brain className="h-4 w-4 flex-shrink-0" />
                                    <span className="font-medium text-sm">Focus Time</span>
                                </>
                            ) : (
                                <>
                                    <Coffee className="h-4 w-4 flex-shrink-0" />
                                    <span className="font-medium text-sm">Break Time</span>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-white/70">{sessions} sessions</span>
                            {/* Session dots */}
                            <div className="flex gap-0.5">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-1.5 h-1.5 rounded-full ${i < (sessions % 4) ? "bg-white" : "bg-white/30"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={resetTimer}
                            className="text-white hover:bg-white/20 rounded-full h-9 w-9"
                            title="Reset timer"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                            onClick={toggleTimer}
                            className={`rounded-full h-10 w-10 ${isRunning
                                ? "bg-white/20 hover:bg-white/30 text-white"
                                : "bg-white text-ace-blue hover:bg-white/90"
                                }`}
                            title={isRunning ? "Pause timer" : "Start timer"}
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
                            className="text-white hover:bg-white/20 rounded-full h-9 w-9"
                            title={mode === "focus" ? "Skip to break" : "Skip to focus"}
                        >
                            {mode === "focus" ? (
                                <Coffee className="h-4 w-4" />
                            ) : (
                                <Brain className="h-4 w-4" />
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsFullscreen(true)}
                            className="text-white hover:bg-white/20 rounded-full h-9 w-9"
                            title="Enter fullscreen mode"
                        >
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Fullscreen Timer Modal */}
            <FullscreenTimer isOpen={isFullscreen} onClose={() => setIsFullscreen(false)} />
        </>
    );
}

