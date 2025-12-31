"use client";

import { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, CheckCircle, XCircle, Brain, Target, Award } from "lucide-react";
import { logStudySession } from "@/lib/actions/study";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface FocusSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    subject: string;
    plannedDuration: number; // minutes
}

export function FocusSessionModal({
    isOpen,
    onClose,
    subject,
    plannedDuration
}: FocusSessionModalProps) {
    const [timeLeft, setTimeLeft] = useState(plannedDuration * 60);
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [actualDuration, setActualDuration] = useState(0); // minutes logged

    // Results state
    const [xpGained, setXpGained] = useState(0);
    const [badges, setBadges] = useState<any[]>([]);

    const { toast } = useToast();
    const router = useRouter();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Init audio and reset state on open
    useEffect(() => {
        if (isOpen) {
            setTimeLeft(plannedDuration * 60);
            setIsActive(false);
            setIsPaused(false);
            setIsCompleted(false);
            setStartTime(null);
            setActualDuration(0);
            setXpGained(0);
            setBadges([]);

            // Preload audio
            audioRef.current = new Audio("/notification.mp3");
            audioRef.current.volume = 0.5;
        }
    }, [isOpen, plannedDuration]);

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && !isPaused && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            // Auto-complete when time flows out
            handleComplete();
        }

        return () => clearInterval(interval);
    }, [isActive, isPaused, timeLeft]);

    const handleStart = () => {
        setIsActive(true);
        setIsPaused(false);
        if (!startTime) setStartTime(new Date());
    };

    const handlePause = () => {
        setIsPaused(!isPaused);
    };

    const handleComplete = async () => {
        setIsActive(false);

        // Calculate effective duration
        // Use planned duration if timer finished, or calculated elapsed if stopped early
        // For simplicity/fairness: strict elapsed time calculation
        const elapsedSeconds = (plannedDuration * 60) - timeLeft;
        const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

        setActualDuration(elapsedMinutes);

        // Play sound
        try {
            audioRef.current?.play().catch(() => { });
        } catch (e) { }

        // Log session
        try {
            const result = await logStudySession(subject, elapsedMinutes, "Completed via Focus Mode");

            if (result.success) {
                setIsCompleted(true);
                setXpGained(result.xpGained || 0);
                setBadges(result.newBadges || []);
                router.refresh();
            } else {
                toast({ title: "Error", description: "Failed to log session", variant: "destructive" });
                onClose();
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
        }
    };

    // Derived values for UI
    const totalSeconds = plannedDuration * 60;
    const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-[95vw] sm:max-w-md bg-white rounded-3xl border-0 shadow-2xl overflow-hidden p-0 gap-0">

                {/* Header / Top Section */}
                <div className={cn(
                    "p-6 text-center transition-colors duration-500",
                    isCompleted ? "bg-green-50" : isActive && !isPaused ? "bg-ace-blue text-white" : "bg-gray-50 text-ace-blue"
                )}>
                    {!isCompleted ? (
                        <>
                            <div className="mx-auto bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                                <Brain className={cn("w-6 h-6", isActive && !isPaused ? "text-white" : "text-ace-blue")} />
                            </div>
                            <DialogTitle className="font-serif text-2xl font-normal mb-1">
                                {subject}
                            </DialogTitle>
                            <DialogDescription className={cn(isActive && !isPaused ? "text-white/60" : "text-ace-blue/60")}>
                                {isActive ? "Keep focused!" : "Ready to start?"}
                            </DialogDescription>
                        </>
                    ) : (
                        <>
                            <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <DialogTitle className="font-serif text-2xl font-bold text-green-800 mb-1">
                                Session Complete!
                            </DialogTitle>
                            <DialogDescription className="text-green-700">
                                You focused for {actualDuration} minutes.
                            </DialogDescription>
                        </>
                    )}
                </div>

                {/* Body */}
                <div className="p-8">
                    {!isCompleted ? (
                        <div className="flex flex-col items-center">
                            {/* Timer Display */}
                            <div className="text-6xl font-serif font-bold tabular-nums text-ace-blue mb-8 tracking-tighter">
                                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                            </div>

                            {/* Circular Progress (Using standard Progress bar for simplicity but styled) */}
                            <Progress value={progress} className="h-2 w-full mb-8" />

                            {/* Controls */}
                            <div className="flex gap-4 w-full">
                                {!isActive ? (
                                    <Button onClick={handleStart} className="w-full h-12 rounded-full text-lg bg-ace-blue hover:bg-ace-light transition-all shadow-lg hover:shadow-xl">
                                        <Play className="w-5 h-5 mr-2 fill-current" />
                                        Start Focus
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={handlePause}
                                            className="h-12 w-12 rounded-full border-2 border-ace-blue/10 flex-shrink-0"
                                        >
                                            {isPaused ? <Play className="w-5 h-5 fill-ace-blue text-ace-blue" /> : <Pause className="w-5 h-5 fill-ace-blue text-ace-blue" />}
                                        </Button>
                                        <Button
                                            onClick={handleComplete}
                                            variant={isPaused ? "default" : "secondary"}
                                            className="flex-1 h-12 rounded-full text-lg"
                                        >
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                            Finish Early
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Results View
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex flex-col items-center text-center">
                                    <span className="text-amber-800 text-xs font-bold uppercase tracking-wider mb-1">XP Earned</span>
                                    <span className="text-3xl font-serif font-bold text-amber-600">+{xpGained}</span>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex flex-col items-center text-center">
                                    <span className="text-blue-800 text-xs font-bold uppercase tracking-wider mb-1">Focus Score</span>
                                    <span className="text-3xl font-serif font-bold text-blue-600">100%</span>
                                </div>
                            </div>

                            {badges.length > 0 && (
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100">
                                    <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                                        <Award className="w-4 h-4" /> New Badges
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {badges.map((b, i) => (
                                            <span key={i} className="px-2 py-1 bg-white rounded-md text-xs font-bold text-purple-700 shadow-sm border border-purple-100">
                                                {b.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Button onClick={onClose} className="w-full h-12 rounded-full bg-ace-blue hover:bg-ace-light text-white text-lg mt-2">
                                Close & Continue
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
