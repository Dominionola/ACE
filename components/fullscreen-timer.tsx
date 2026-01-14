"use client";

import { useTimer } from "@/contexts/timer-context";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Coffee, Brain, Minimize2, Volume2, VolumeX } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FullscreenTimerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FullscreenTimer({ isOpen, onClose }: FullscreenTimerProps) {
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

    const [isMuted, setIsMuted] = useState(false);

    // Lock body scroll when fullscreen is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Handle escape key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
            if (e.key === " " && isOpen) {
                e.preventDefault();
                toggleTimer();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose, toggleTimer]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`fixed inset-0 z-[100] flex items-center justify-center transition-colors duration-700 ${mode === "focus"
                        ? "bg-gradient-to-br from-[#0a1628] via-ace-blue to-[#1a365d]"
                        : "bg-gradient-to-br from-[#052e16] via-green-700 to-[#14532d]"
                    }`}
            >
                {/* Ambient animated background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className={`absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl opacity-20 animate-pulse ${mode === "focus" ? "bg-ace-light" : "bg-green-400"
                        }`} />
                    <div className={`absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl opacity-20 animate-pulse delay-1000 ${mode === "focus" ? "bg-indigo-400" : "bg-emerald-400"
                        }`} />
                </div>

                {/* Top Bar */}
                <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3 text-white/70">
                        {mode === "focus" ? (
                            <Brain className="h-6 w-6" />
                        ) : (
                            <Coffee className="h-6 w-6" />
                        )}
                        <span className="text-lg font-medium">
                            {mode === "focus" ? "Deep Focus Mode" : "Rest & Recharge"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMuted(!isMuted)}
                            className="text-white/60 hover:text-white hover:bg-white/10 rounded-full"
                        >
                            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-white/60 hover:text-white hover:bg-white/10 rounded-full"
                        >
                            <Minimize2 className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Main Timer Display */}
                <div className="relative flex flex-col items-center">
                    {/* Giant Timer Circle */}
                    <motion.div
                        className="relative w-80 h-80 md:w-96 md:h-96"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <svg className="w-full h-full transform -rotate-90">
                            {/* Background circle */}
                            <circle
                                cx="50%"
                                cy="50%"
                                r="45%"
                                fill="none"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="8"
                            />
                            {/* Progress circle */}
                            <circle
                                cx="50%"
                                cy="50%"
                                r="45%"
                                fill="none"
                                stroke="white"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 45} ${2 * Math.PI * 45}`}
                                strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
                                className="transition-all duration-1000"
                                style={{ filter: "drop-shadow(0 0 20px rgba(255,255,255,0.5))" }}
                            />
                        </svg>

                        {/* Time Display */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.span
                                className="text-7xl md:text-8xl font-serif font-bold text-white tracking-tight"
                                key={`${minutes}:${seconds}`}
                            >
                                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                            </motion.span>
                            <span className="text-white/50 text-lg mt-2 uppercase tracking-widest">
                                {mode === "focus" ? "Stay Focused" : "Take a Break"}
                            </span>
                        </div>
                    </motion.div>

                    {/* Controls */}
                    <motion.div
                        className="flex items-center justify-center gap-6 mt-12"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={resetTimer}
                            className="text-white/60 hover:text-white hover:bg-white/10 rounded-full h-14 w-14"
                            title="Reset timer"
                        >
                            <RotateCcw className="h-6 w-6" />
                        </Button>

                        <Button
                            onClick={toggleTimer}
                            className={`rounded-full h-20 w-20 shadow-2xl transition-all duration-300 ${isRunning
                                    ? "bg-white/20 hover:bg-white/30 text-white"
                                    : "bg-white text-ace-blue hover:bg-white/90 hover:scale-105"
                                }`}
                            title={isRunning ? "Pause timer (Space)" : "Start timer (Space)"}
                        >
                            {isRunning ? (
                                <Pause className="h-8 w-8" />
                            ) : (
                                <Play className="h-8 w-8 ml-1" />
                            )}
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={skipToNext}
                            className="text-white/60 hover:text-white hover:bg-white/10 rounded-full h-14 w-14"
                            title={mode === "focus" ? "Skip to break" : "Skip to focus"}
                        >
                            {mode === "focus" ? (
                                <Coffee className="h-6 w-6" />
                            ) : (
                                <Brain className="h-6 w-6" />
                            )}
                        </Button>
                    </motion.div>

                    {/* Session Progress Dots */}
                    <motion.div
                        className="flex items-center gap-3 mt-10"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <span className="text-white/40 text-sm mr-2">{sessions} sessions</span>
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${i < (sessions % 4)
                                        ? "bg-white shadow-lg shadow-white/30"
                                        : "bg-white/20"
                                    }`}
                            />
                        ))}
                    </motion.div>
                </div>

                {/* Bottom hint */}
                <div className="absolute bottom-6 left-0 right-0 text-center">
                    <p className="text-white/30 text-sm">
                        Press <kbd className="px-2 py-1 bg-white/10 rounded mx-1">Space</kbd> to {isRunning ? "pause" : "start"} •
                        <kbd className="px-2 py-1 bg-white/10 rounded mx-1">Esc</kbd> to exit
                    </p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
