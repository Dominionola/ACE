"use client";

import { useWorkflow } from "@/contexts/workflow-context";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, Play, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

export function ActiveSessionCard() {
    const { hasActiveSession, stageInfo, sessionDuration, isLoading } = useWorkflow();

    if (isLoading) return null; // Or skeleton
    if (!hasActiveSession) return null;

    return (
        <div className="mb-6 bg-gradient-to-r from-ace-blue to-ace-light text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <BookOpen className="w-32 h-32 text-white" />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-medium animate-pulse">
                            Active Session
                        </span>
                        <span className="text-white/80 text-sm flex items-center gap-1">
                            <Play className="h-3 w-3" /> {sessionDuration}m elapsed
                        </span>
                    </div>
                    <h2 className="font-serif text-2xl font-semibold mb-1">
                        {stageInfo?.title || "Study Session"}
                    </h2>
                    <p className="text-white/80 text-sm max-w-md">
                        Pick up right where you left off.
                    </p>
                </div>

                <Link href="/dashboard/study/active">
                    <Button
                        size="lg"
                        className="bg-white text-ace-blue hover:bg-white/90 rounded-full shadow-md font-medium border-0"
                    >
                        Continue Session
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
