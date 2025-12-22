"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";

type TimerMode = "focus" | "break";

interface StudyTimerProps {
    // Optional customization
    focusDuration?: number; // in minutes, default 25
    breakDuration?: number; // in minutes, default 5
}

export function StudyTimer({
    focusDuration = 25,
    breakDuration = 5,
}: StudyTimerProps) {
    const [mode, setMode] = useState<TimerMode>("focus");
    const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [sessions, setSessions] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Create audio on client side
    useEffect(() => {
        audioRef.current = new Audio("/notification.mp3");
        audioRef.current.volume = 0.5;
    }, []);

    const totalTime = mode === "focus" ? focusDuration * 60 : breakDuration * 60;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const playNotification = useCallback(() => {
        try {
            audioRef.current?.play().catch(() => {
                // Ignore audio play errors (user may not have interacted yet)
            });
        } catch {
            // Fallback: visual only
        }
    }, []);

    const switchMode = useCallback(() => {
        if (mode === "focus") {
            setMode("break");
            setTimeLeft(breakDuration * 60);
            setSessions(s => s + 1);
        } else {
            setMode("focus");
            setTimeLeft(focusDuration * 60);
        }
        playNotification();
    }, [mode, breakDuration, focusDuration, playNotification]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(t => t - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            switchMode();
        }

        return () => clearInterval(interval);
    }, [isRunning, timeLeft, switchMode]);

    const toggleTimer = () => setIsRunning(!isRunning);

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(mode === "focus" ? focusDuration * 60 : breakDuration * 60);
    };

    const skipToNext = () => {
        setIsRunning(false);
        switchMode();
    };

    return (
        <div className={`rounded-3xl p-6 transition-all duration-500 ${mode === "focus"
                ? "bg-gradient-to-br from-ace-blue to-ace-light"
                : "bg-gradient-to-br from-green-600 to-green-500"
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-white">
                    {mode === "focus" ? (
                        <>
                            <Brain className="h-5 w-5" />
                            <span className="font-medium">Focus Time</span>
                        </>
                    ) : (
                        <>
                            <Coffee className="h-5 w-5" />
                            <span className="font-medium">Break Time</span>
                        </>
                    )}
                </div>
                <div className="text-white/70 text-sm">
                    {sessions} sessions
                </div>
            </div>

            {/* Timer Circle */}
            <div className="relative w-48 h-48 mx-auto mb-6">
                {/* Background circle */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="96"
                        cy="96"
                        r="88"
                        fill="none"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="8"
                    />
                    <circle
                        cx="96"
                        cy="96"
                        r="88"
                        fill="none"
                        stroke="white"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 88}
                        strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
                        className="transition-all duration-1000"
                    />
                </svg>
                {/* Time Display */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl font-serif font-bold text-white">
                        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetTimer}
                    className="text-white hover:bg-white/20 rounded-full h-12 w-12"
                >
                    <RotateCcw className="h-5 w-5" />
                </Button>

                <Button
                    onClick={toggleTimer}
                    className={`rounded-full h-14 w-14 ${isRunning
                            ? "bg-white/20 hover:bg-white/30"
                            : "bg-white text-ace-blue hover:bg-white/90"
                        }`}
                >
                    {isRunning ? (
                        <Pause className="h-6 w-6" />
                    ) : (
                        <Play className="h-6 w-6 ml-1" />
                    )}
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={skipToNext}
                    className="text-white hover:bg-white/20 rounded-full h-12 w-12"
                    title={mode === "focus" ? "Skip to break" : "Skip to focus"}
                >
                    {mode === "focus" ? (
                        <Coffee className="h-5 w-5" />
                    ) : (
                        <Brain className="h-5 w-5" />
                    )}
                </Button>
            </div>

            {/* Session Progress */}
            <div className="mt-6 flex justify-center gap-1">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${i < (sessions % 4)
                                ? "bg-white"
                                : "bg-white/30"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
