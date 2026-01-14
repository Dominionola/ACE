"use client";

import { useTimer } from "@/contexts/timer-context";
import { Button } from "@/components/ui/button";
import { Clock, Play, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TimerWidgetProps {
    duration: number; // in minutes
    goal?: string;
}

export function TimerWidget({ duration, goal }: TimerWidgetProps) {
    const timer = useTimer();
    const router = useRouter();
    const [isStarted, setIsStarted] = useState(false);

    const handleStart = () => {
        // Start the session using the context function
        timer.startSession(duration);
        setIsStarted(true);
        // Navigate to active study page
        router.push("/dashboard/study/active");
    };

    return (
        <div className="bg-white rounded-2xl border border-ace-blue/10 shadow-sm max-w-sm w-full my-2 overflow-hidden mx-auto">
            <div className="p-5 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-ace-blue/5 rounded-full flex items-center justify-center mb-3">
                    <Clock className="h-6 w-6 text-ace-blue" />
                </div>

                <h3 className="text-lg font-serif font-semibold text-ace-blue">
                    Ready to Focus?
                </h3>

                {goal && (
                    <p className="text-sm text-ace-blue/70 mt-1 mb-4 max-w-[200px]">
                        Goal: <span className="font-medium italic">"{goal}"</span>
                    </p>
                )}

                <div className="text-3xl font-mono font-bold text-ace-blue mb-6 tracking-tight">
                    {duration}:00
                </div>

                <Button
                    onClick={handleStart}
                    disabled={isStarted}
                    className={cn(
                        "w-full rounded-full transition-all duration-300",
                        isStarted
                            ? "bg-green-100 text-green-700 hover:bg-green-200 shadow-none border border-green-200"
                            : "bg-ace-blue hover:bg-ace-light text-white shadow-md hover:shadow-lg"
                    )}
                >
                    {isStarted ? (
                        <>
                            <Check className="h-4 w-4 mr-2" />
                            Session Started
                        </>
                    ) : (
                        <>
                            <Play className="h-4 w-4 mr-2" />
                            Start {duration}m Session
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
