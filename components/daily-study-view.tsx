"use client";

import { useState } from "react";
import { ScheduleBlock } from "@/lib/utils/schedule";
import { formatDuration, getSubjectColor } from "@/lib/utils/schedule";
import { Clock, Play, CheckCircle, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logStudySession } from "@/lib/actions/study";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { FocusSessionModal } from "@/components/focus-session-modal";

interface DailyStudyViewProps {
    initialPlan: { blocks: ScheduleBlock[]; weekNumber: number; dayName: string };
}

export function DailyStudyView({ initialPlan }: DailyStudyViewProps) {
    const [selectedBlock, setSelectedBlock] = useState<ScheduleBlock | null>(null);

    return (
        <div className="space-y-6">
            <FocusSessionModal
                isOpen={!!selectedBlock}
                onClose={() => setSelectedBlock(null)}
                subject={selectedBlock?.subject || ""}
                plannedDuration={selectedBlock?.duration || 25}
            />

            {/* Summary Card */}
            <div className="bg-ace-blue text-white p-8 rounded-3xl flex items-center justify-between shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-serif mb-1">
                        {deriveTotalHours(initialPlan.blocks)} Hours
                    </h2>
                    <p className="text-ace-blue-100 opacity-80">Total Focus Time Planned</p>
                </div>
                <div className="relative z-10">
                    <div className="text-right">
                        <span className="text-5xl font-bold">{initialPlan.blocks.length}</span>
                        <span className="text-lg opacity-60 ml-2">Sessions</span>
                    </div>
                </div>
                {/* Decor */}
                <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
            </div>

            {/* Timeline View */}
            <div className="grid gap-4">
                {initialPlan.blocks.map((block, idx) => (
                    <div
                        key={idx}
                        className="group bg-white p-6 rounded-3xl border border-ace-blue/10 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center gap-6"
                    >
                        {/* Time/Duration */}
                        <div className="w-full md:w-32 flex-shrink-0 flex items-center gap-2 text-ace-blue/60">
                            <Clock className="w-5 h-5" />
                            <span className="font-medium">{formatDuration(block.duration)}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 w-full">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-xl font-bold text-ace-blue">{block.subject}</h3>
                                {block.isEmphasis && (
                                    <span className="bg-ace-accent/20 text-ace-blue px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                        Focus
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-ace-blue/50">
                                Recommended session based on your goals.
                            </p>
                        </div>

                        {/* Action */}
                        <div className="w-full md:w-auto">
                            <Button
                                size="lg"
                                className="w-full md:w-auto rounded-full gap-2 bg-ace-blue text-white hover:bg-ace-light hover:shadow-lg transition-all"
                                onClick={() => setSelectedBlock(block)}
                            >
                                <Play className="w-5 h-5 fill-current" />
                                Start Session
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function deriveTotalHours(blocks: ScheduleBlock[]) {
    const mins = blocks.reduce((acc, b) => acc + b.duration, 0);
    return (mins / 60).toFixed(1);
}
