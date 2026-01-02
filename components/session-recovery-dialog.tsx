"use client";

import { useTimer } from "@/contexts/timer-context";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Play, Trash2, Brain, Coffee } from "lucide-react";

export function SessionRecoveryDialog() {
    const timer = useTimer();

    if (!timer.hasInterruptedSession || !timer.interruptedSessionData) {
        return null;
    }

    const { mode, timeLeft, sessions } = timer.interruptedSessionData;

    // Calculate remaining time display
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;

    return (
        <Dialog open={timer.hasInterruptedSession} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-serif text-xl text-ace-blue">
                        <Clock className="h-5 w-5 text-ace-blue" />
                        Resume Your Study Session?
                    </DialogTitle>
                    <DialogDescription asChild>
                        <div className="space-y-3 pt-2">
                            <p>You have an unfinished study session from earlier.</p>

                            <div className="bg-ace-blue/5 p-4 rounded-xl border border-ace-blue/10">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${mode === "focus" ? "bg-ace-blue/10" : "bg-green-100"}`}>
                                        {mode === "focus" ? (
                                            <Brain className="h-5 w-5 text-ace-blue" />
                                        ) : (
                                            <Coffee className="h-5 w-5 text-green-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-ace-blue">
                                            {mode === "focus" ? "Focus Session" : "Break Time"}
                                        </p>
                                        <p className="text-sm text-ace-blue/60">
                                            {mins}:{String(secs).padStart(2, "0")} remaining • {sessions} sessions completed
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={timer.discardSession}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                        <Trash2 className="h-4 w-4" />
                        Discard
                    </Button>
                    <Button
                        onClick={timer.resumeSession}
                        className="flex items-center gap-2 bg-ace-blue hover:bg-ace-light"
                    >
                        <Play className="h-4 w-4" />
                        Resume Session
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
