"use client";

import { useEffect, useState } from "react";
import { getTodaysPlan } from "@/lib/actions/today";
import { ScheduleBlock } from "@/lib/utils/schedule";
import { Calendar, Clock, CheckCircle, ArrowRight, Loader2, Coffee, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration, getSubjectColor } from "@/lib/utils/schedule";
import { logStudySession } from "@/lib/actions/study";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function TodaysPlan() {
    const [plan, setPlan] = useState<{ blocks: ScheduleBlock[]; weekNumber: number; dayName: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loggingId, setLoggingId] = useState<number | null>(null); // Index of block being logged
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        async function fetchPlan() {
            try {
                const data = await getTodaysPlan();
                setPlan(data);
            } catch (error) {
                console.error("Failed to fetch plan:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchPlan();
    }, []);

    const handleQuickLog = async (block: ScheduleBlock, index: number) => {
        setLoggingId(index);
        const result = await logStudySession(block.subject, block.duration, "Completed via Daily Plan");
        setLoggingId(null);

        if (result.success) {
            let desc = `${block.duration}m logged for ${block.subject}.`;
            if (result.xpGained) desc += ` (+${result.xpGained} XP!)`;

            toast({
                title: "Session Logged!",
                description: desc,
            });

            if (result.newBadges && result.newBadges.length > 0) {
                result.newBadges.forEach((b: any) => {
                    toast({
                        title: `🏆 Badge Unlocked: ${b.name}`,
                        description: b.description,
                        className: "bg-amber-50 border-amber-200 text-amber-900 border-2",
                    });
                });
            }

            router.refresh(); // Update stats
        } else {
            toast({
                title: "Error",
                description: "Failed to log session.",
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return <div className="animate-pulse h-32 bg-gray-100 rounded-3xl"></div>;
    }

    if (!plan || plan.blocks.length === 0) {
        // Check if user has a schedule at all (weekNumber > 0 means they have a strategy)
        const hasScheduleSetup = plan && plan.weekNumber > 0;

        if (!hasScheduleSetup) {
            // User hasn't set up their study schedule yet - CTA to set it up
            return (
                <div className="bg-gradient-to-br from-ace-blue/5 to-indigo-50 p-6 rounded-2xl border border-ace-blue/10 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Calendar className="w-24 h-24 text-ace-blue" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-ace-blue/10 rounded-full">
                                <Calendar className="h-5 w-5 text-ace-blue" />
                            </div>
                            <h2 className="font-serif text-xl text-ace-blue">Set Up Your Study Plan</h2>
                        </div>

                        <p className="text-ace-blue/70 text-sm mb-4">
                            Create a weekly study schedule to see your daily focus here. ACE will help you stay on track!
                        </p>

                        <a
                            href="/dashboard/schedule"
                            className="inline-flex items-center gap-2 text-sm bg-ace-blue text-white px-4 py-2 rounded-full hover:bg-ace-light transition-colors shadow-md"
                        >
                            <Sparkles className="h-4 w-4" />
                            Create Your Schedule
                            <ArrowRight className="h-4 w-4" />
                        </a>
                    </div>
                </div>
            );
        }

        // User has schedule but today is a rest day
        return (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Coffee className="w-24 h-24 text-green-600" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-100 rounded-full">
                            <Sparkles className="h-5 w-5 text-green-600" />
                        </div>
                        <h2 className="font-serif text-xl text-green-800">Rest Day</h2>
                    </div>

                    <p className="text-green-700/80 text-sm mb-4">
                        No study sessions scheduled. Take time to recharge – rest is essential for learning!
                    </p>

                    <div className="flex flex-wrap gap-2">
                        <a
                            href="/dashboard/schedule"
                            className="inline-flex items-center gap-1.5 text-xs bg-white/80 text-green-700 px-3 py-1.5 rounded-full hover:bg-white transition-colors"
                        >
                            <Calendar className="h-3 w-3" />
                            View schedule
                        </a>
                        <a
                            href="/dashboard/grades"
                            className="inline-flex items-center gap-1.5 text-xs bg-white/80 text-green-700 px-3 py-1.5 rounded-full hover:bg-white transition-colors"
                        >
                            <CheckCircle className="h-3 w-3" />
                            Review progress
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-3xl border border-ace-blue/10 shadow-sm mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Calendar className="w-32 h-32 text-ace-blue" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="font-serif text-2xl text-ace-blue">Today's Focus</h2>
                        <a href="/dashboard/study/today" className="text-ace-blue/60 text-sm hover:text-ace-blue underline decoration-dotted transition-colors">
                            View Full Plan &rarr;
                        </a>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-bold font-serif text-ace-blue">
                            {deriveTotalHours(plan.blocks)}
                        </span>
                        <span className="text-sm text-ace-blue/50 ml-1">hrs</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {plan.blocks.map((block, idx) => (
                        <div
                            key={idx}
                            className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition-all hover:shadow-md ${getSubjectColor(block.subject, block.isEmphasis)}`}
                        >
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-sm truncate" title={block.subject}>
                                        {block.subject}
                                    </span>
                                    {block.isEmphasis && (
                                        <span className="text-[10px] uppercase font-bold bg-white/20 px-1.5 py-0.5 rounded">Focus</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 text-xs opacity-80">
                                    <Clock className="h-3 w-3" />
                                    {formatDuration(block.duration)}
                                </div>
                            </div>

                            <Button
                                size="sm"
                                variant="ghost"
                                className="w-full justify-between hover:bg-white/20 h-7 text-xs mt-1 group"
                                onClick={() => handleQuickLog(block, idx)}
                                disabled={loggingId === idx}
                            >
                                <span>{loggingId === idx ? "Logging..." : "Mark Done"}</span>
                                {loggingId === idx ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function deriveTotalHours(blocks: ScheduleBlock[]) {
    const mins = blocks.reduce((acc, b) => acc + b.duration, 0);
    return (mins / 60).toFixed(1);
}
