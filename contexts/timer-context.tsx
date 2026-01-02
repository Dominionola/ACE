"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";

type TimerMode = "focus" | "break";

interface TimerState {
    mode: TimerMode;
    timeLeft: number;
    isRunning: boolean;
    sessions: number;
    focusDuration: number;
    breakDuration: number;
}

interface TimerContextType extends TimerState {
    toggleTimer: () => void;
    resetTimer: () => void;
    skipToNext: () => void;
    progress: number;
    minutes: number;
    seconds: number;
}

const TimerContext = createContext<TimerContextType | null>(null);

export function useTimer() {
    const context = useContext(TimerContext);
    if (!context) {
        throw new Error("useTimer must be used within a TimerProvider");
    }
    return context;
}

export function useTimerOptional() {
    return useContext(TimerContext);
}

interface TimerProviderProps {
    children: ReactNode;
    focusDuration?: number;
    breakDuration?: number;
}

export function TimerProvider({
    children,
    focusDuration = 25,
    breakDuration = 5,
}: TimerProviderProps) {
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
            audioRef.current?.play().catch(() => { });
        } catch { }
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
        } else if (isRunning && timeLeft === 0) {
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
        <TimerContext.Provider
            value={{
                mode,
                timeLeft,
                isRunning,
                sessions,
                focusDuration,
                breakDuration,
                toggleTimer,
                resetTimer,
                skipToNext,
                progress,
                minutes,
                seconds,
            }}
        >
            {children}
        </TimerContext.Provider>
    );
}
