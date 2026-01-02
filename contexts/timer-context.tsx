"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { saveTimerState, loadTimerState, clearTimerState, keepSessionAlive } from "@/lib/actions/timer";

type TimerMode = "focus" | "break";

interface TimerState {
    mode: TimerMode;
    timeLeft: number;
    isRunning: boolean;
    sessions: number;
    focusDuration: number;
    breakDuration: number;
}

interface InterruptedSessionData {
    mode: TimerMode;
    timeLeft: number;
    sessions: number;
}

interface TimerContextType extends TimerState {
    toggleTimer: () => void;
    resetTimer: () => void;
    skipToNext: () => void;
    progress: number;
    minutes: number;
    seconds: number;
    hasInterruptedSession: boolean;
    interruptedSessionData: InterruptedSessionData | null;
    resumeSession: () => void;
    discardSession: () => void;
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
    const [hasInterruptedSession, setHasInterruptedSession] = useState(false);
    const [interruptedState, setInterruptedState] = useState<{
        mode: TimerMode;
        timeLeft: number;
        sessions: number;
    } | null>(null);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Create audio on client side
    useEffect(() => {
        audioRef.current = new Audio("/notification.mp3");
        audioRef.current.volume = 0.5;
    }, []);

    // Load saved state on mount
    useEffect(() => {
        async function loadState() {
            try {
                const result = await loadTimerState();
                if (result.success && result.data) {
                    // Calculate if session is still valid (within last 24 hours)
                    const lastUpdate = new Date(result.data.last_updated_at);
                    const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);

                    if (hoursSinceUpdate < 24) {
                        // Show recovery prompt
                        setInterruptedState({
                            mode: result.data.mode,
                            timeLeft: result.data.time_remaining,
                            sessions: result.data.sessions_completed,
                        });
                        setHasInterruptedSession(true);
                    } else {
                        // Session too old, clear it
                        await clearTimerState();
                    }
                }
            } catch (error) {
                console.error("Failed to load timer state:", error);
            }
        }
        loadState();
    }, []);

    // Save state periodically when timer is running
    useEffect(() => {
        if (!isRunning) return;

        // Save immediately on start
        saveTimerState({
            mode,
            timeRemaining: timeLeft,
            sessionsCompleted: sessions,
            focusDuration,
            breakDuration,
        }).catch(error => console.error("Failed to save timer state:", error));

        // Then save every 5 seconds while running
        saveTimeoutRef.current = setInterval(async () => {
            try {
                await saveTimerState({
                    mode,
                    timeRemaining: timeLeft,
                    sessionsCompleted: sessions,
                    focusDuration,
                    breakDuration,
                });
            } catch (error) {
                console.error("Failed to save timer state:", error);
            }
        }, 5000);

        return () => {
            if (saveTimeoutRef.current) {
                clearInterval(saveTimeoutRef.current);
            }
        };
    }, [isRunning]);
    // Keep session alive while timer is running
    useEffect(() => {
        if (!isRunning) {
            if (keepAliveIntervalRef.current) {
                clearInterval(keepAliveIntervalRef.current);
                keepAliveIntervalRef.current = null;
            }
            return;
        }

        // Keep session alive every 5 minutes
        keepAliveIntervalRef.current = setInterval(async () => {
            try {
                const result = await keepSessionAlive();
                if (!result.success) {
                    console.warn("Session keep-alive failed:", result.error);
                }
            } catch (error) {
                console.error("Keep-alive error:", error);
            }
        }, 5 * 60 * 1000); // Every 5 minutes

        return () => {
            if (keepAliveIntervalRef.current) {
                clearInterval(keepAliveIntervalRef.current);
            }
        };
    }, [isRunning]);

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

    const toggleTimer = async () => {
        const newIsRunning = !isRunning;
        setIsRunning(newIsRunning);

        if (newIsRunning) {
            // Starting timer - save initial state
            await saveTimerState({
                mode,
                timeRemaining: timeLeft,
                sessionsCompleted: sessions,
                focusDuration,
                breakDuration,
            });
        }
    };

    const resetTimer = async () => {
        setIsRunning(false);
        setTimeLeft(mode === "focus" ? focusDuration * 60 : breakDuration * 60);
        // Clear saved state on reset
        await clearTimerState();
    };

    const skipToNext = () => {
        setIsRunning(false);
        switchMode();
    };

    const resumeSession = () => {
        if (interruptedState) {
            setMode(interruptedState.mode);
            setTimeLeft(interruptedState.timeLeft);
            setSessions(interruptedState.sessions);
            setHasInterruptedSession(false);
            setInterruptedState(null);
            // Don't auto-start, let user press play
        }
    };

    const discardSession = async () => {
        setHasInterruptedSession(false);
        setInterruptedState(null);
        await clearTimerState();
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
                hasInterruptedSession,
                interruptedSessionData: interruptedState,
                resumeSession,
                discardSession,
            }}
        >
            {children}
        </TimerContext.Provider>
    );
}
