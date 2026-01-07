"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, Circle, CalendarDays, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { updateMilestoneStatus } from "@/lib/actions/plans";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface StudyPlanViewProps {
    plan: any; // Type from DB
}

export function StudyPlanView({ plan }: StudyPlanViewProps) {
    // We maintain local state for optimistic updates
    const [milestones, setMilestones] = useState(plan.plan_milestones);

    const toggleMilestone = async (id: string, currentStatus: boolean) => {
        // Optimistic update
        const newStatus = !currentStatus;
        setMilestones((prev: any[]) => prev.map(m =>
            m.id === id ? { ...m, is_completed: newStatus } : m
        ));

        // Server action
        await updateMilestoneStatus(id, newStatus);
    };

    const completedCount = milestones.filter((m: any) => m.is_completed).length;
    const totalCount = milestones.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
        <Card className="p-6 border-ace-blue/10 shadow-sm bg-white rounded-3xl mb-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-serif text-ace-blue font-bold">{plan.title}</h3>
                    <p className="text-sm text-ace-blue/60 flex items-center gap-2 mt-1">
                        <CalendarDays className="h-4 w-4" />
                        Target: {format(new Date(plan.target_date), "MMMM d, yyyy")}
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold text-ace-blue">{Math.round(progress)}%</span>
                    <span className="text-xs text-ace-blue/40 block">Complete</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-ace-blue/5 h-2 rounded-full mb-8 overflow-hidden">
                <div
                    className="h-full bg-green-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Timeline */}
            <div className="relative pl-4 border-l-2 border-ace-blue/10 space-y-8">
                {milestones.map((milestone: any, index: number) => (
                    <motion.div
                        key={milestone.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                    >
                        {/* Dot */}
                        <div className={cn(
                            "absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 bg-white transition-colors",
                            milestone.is_completed ? "border-green-500 bg-green-500" : "border-ace-blue/30"
                        )} />

                        <div className="flex items-start justify-between gap-4 group">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className={cn(
                                        "font-medium transition-colors",
                                        milestone.is_completed ? "text-gray-400 line-through" : "text-ace-blue"
                                    )}>
                                        {milestone.title}
                                    </h4>
                                    <span className="text-xs text-ace-blue/40 px-2 py-0.5 bg-ace-blue/5 rounded-full">
                                        Due {format(new Date(milestone.date_due), "MMM d")}
                                    </span>
                                </div>
                                <p className={cn(
                                    "text-sm",
                                    milestone.is_completed ? "text-gray-300" : "text-gray-600"
                                )}>
                                    {milestone.description}
                                </p>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleMilestone(milestone.id, milestone.is_completed)}
                                className={cn(
                                    "rounded-full h-8 w-8 p-0 shrink-0",
                                    milestone.is_completed
                                        ? "text-green-500 hover:text-green-600 hover:bg-green-50"
                                        : "text-gray-300 hover:text-ace-blue hover:bg-ace-blue/5"
                                )}
                            >
                                {milestone.is_completed ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                    <Circle className="h-5 w-5" />
                                )}
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </Card>
    );
}
