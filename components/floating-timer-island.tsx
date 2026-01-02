"use client";

import { useTimerOptional } from "@/contexts/timer-context";
import { Play, Pause, Brain, Coffee, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function FloatingTimerIsland() {
    const timer = useTimerOptional();
    const [minimized, setMinimized] = useState(false);

    // Only show if timer is running
    if (!timer || !timer.isRunning) {
        return null;
    }

    const { mode, minutes, seconds, progress, toggleTimer, sessions } = timer;

    if (minimized) {
        return (
            <button
                onClick={() => setMinimized(false)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${mode === "focus"
                        ? "bg-gradient-to-br from-ace-blue to-ace-light"
                        : "bg-gradient-to-br from-green-600 to-green-500"
                    }`}
            >
                <div className="relative">
                    {mode === "focus" ? (
                        <Brain className="h-6 w-6 text-white" />
                    ) : (
                        <Coffee className="h-6 w-6 text-white" />
                    )}
                    {/* Pulsing indicator */}
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-white animate-pulse" />
                </div>
            </button>
        );
    }

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 rounded-3xl shadow-2xl transition-all duration-500 border-2 border-white/20 backdrop-blur-sm ${mode === "focus"
                    ? "bg-gradient-to-br from-ace-blue to-ace-light"
                    : "bg-gradient-to-br from-green-600 to-green-500"
                }`}
        >
            <div className="p-4 flex items-center gap-4">
                {/* Timer Circle (compact) */}
                <div className="relative w-16 h-16">
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

                {/* Info & Controls */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-white">
                        {mode === "focus" ? (
                            <>
                                <Brain className="h-4 w-4" />
                                <span className="text-sm font-medium">Focus</span>
                            </>
                        ) : (
                            <>
                                <Coffee className="h-4 w-4" />
                                <span className="text-sm font-medium">Break</span>
                            </>
                        )}
                    </div>
                    <span className="text-xs text-white/70">{sessions} sessions</span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <Button
                        onClick={toggleTimer}
                        size="icon"
                        className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 text-white"
                    >
                        <Pause className="h-5 w-5" />
                    </Button>
                    <Button
                        onClick={() => setMinimized(true)}
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full text-white/70 hover:text-white hover:bg-white/10"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
