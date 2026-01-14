"use client";

import { useMemo, useState } from "react";
import {
    generateWeeklySchedule,
    formatDuration,
    getSubjectColor,
    getWeekNumber,
    type FocusItem,
} from "@/lib/utils/schedule";
import { downloadICalFile } from "@/lib/utils/export-schedule";
import { Calendar, Clock, ChevronLeft, ChevronRight, Star, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleCalendarSync } from "@/components/google-calendar-sync";

interface StudyScheduleProps {
    focusItems: FocusItem[];
    studyDays?: number[];
    plans?: any[];
}

export function StudySchedule({ focusItems, studyDays = [0, 1, 2, 3, 4], plans = [] }: StudyScheduleProps) {
    const currentWeek = getWeekNumber();
    const [selectedWeek, setSelectedWeek] = useState(currentWeek);

    const schedule = useMemo(
        () => generateWeeklySchedule(focusItems, studyDays, 6, selectedWeek),
        [focusItems, studyDays, selectedWeek]
    );

    // Extract milestones for the selected week
    const weeklyMilestones = useMemo(() => {
        const { start, end } = schedule.dateRange;
        // Simple string comparison for this week logic relying on the formatShortDate is risky across years,
        // but let's trust the util for now or better, parse dates.
        // Actually, let's use the `schedule.days` to match dates if possible or use proper date objects.
        // Since generateWeeklySchedule returns ranges as strings, we might need to be careful.
        // Let's rely on date objects for accurate filtering.

        const weekStart = new Date(); // Getting rough week start
        // To accurately place milestones, we need the actual date of each day card.
        // The generator doesn't return date objects per day, only day names.
        // We can infer dates based on week number and day index.

        const milestonesByDay: Record<string, any[]> = {};

        plans.forEach(plan => {
            if (!plan.plan_milestones) return;
            plan.plan_milestones.forEach((m: any) => {
                const dueDate = new Date(m.date_due);
                const dueWeek = getWeekNumber(dueDate);

                if (dueWeek === selectedWeek) {
                    // Match to day name
                    const dayName = dueDate.toLocaleDateString('en-US', { weekday: 'long' }); // "Monday"
                    if (!milestonesByDay[dayName]) milestonesByDay[dayName] = [];
                    milestonesByDay[dayName].push({ ...m, planTitle: plan.title });
                }
            });
        });

        return milestonesByDay;
    }, [plans, selectedWeek, schedule]);

    if (focusItems.length === 0 && plans.length === 0) {
        return (
            <div className="text-center py-8 text-ace-blue/40">
                <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="font-serif italic">No schedule data available.</p>
                <p className="text-sm mt-1">Add courses to your weekly focus or create a study plan.</p>
            </div>
        );
    }

    const isCurrentWeek = selectedWeek === currentWeek;

    return (
        <div className="space-y-4">
            {/* Header with Week Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-ace-blue">
                    <Calendar className="h-5 w-5" />
                    <div>
                        <h3 className="font-serif text-lg font-semibold">
                            Week {schedule.weekNumber} Schedule
                        </h3>
                        <p className="text-xs text-ace-blue/60">
                            {schedule.dateRange.start} - {schedule.dateRange.end}
                            {isCurrentWeek && (
                                <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium">
                                    Current
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Week Navigation */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => setSelectedWeek(w => Math.max(1, w - 1))}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => setSelectedWeek(currentWeek)}
                        disabled={isCurrentWeek}
                    >
                        Today
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => setSelectedWeek(w => Math.min(52, w + 1))}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="ml-2 gap-1 h-8 rounded-full text-ace-blue/70"
                        onClick={() => downloadICalFile(schedule)}
                    >
                        <Download className="h-3.5 w-3.5" />
                        Export
                    </Button>
                    <GoogleCalendarSync schedule={schedule} />
                </div>
            </div>

            {/* Emphasis Subject Banner */}
            {schedule.emphasisSubject && (
                <div className="flex items-center gap-2 p-3 bg-ace-blue/5 rounded-xl border border-ace-blue/10">
                    <Star className="h-4 w-4 text-ace-accent" />
                    <span className="text-sm text-ace-blue">
                        <strong>Focus this week:</strong> {schedule.emphasisSubject}
                        <span className="text-ace-blue/60 ml-2">(+20% study time)</span>
                    </span>
                </div>
            )}

            {/* Weekly Grid */}
            <div className="grid grid-cols-7 gap-2">
                {schedule.days.map((day) => (
                    <div
                        key={day.day}
                        className={`rounded-xl p-3 min-h-[140px] transition-all flex flex-col ${day.blocks.length > 0
                            ? "bg-white border border-ace-blue/10 shadow-sm"
                            : "bg-cream-50 border border-cream-200"
                            }`}
                    >
                        {/* Day Header */}
                        <div className="text-center mb-2 pb-2 border-b border-ace-blue/5">
                            <span className="font-medium text-ace-blue text-sm">{day.dayShort}</span>
                            {day.totalMinutes > 0 && (
                                <p className="text-xs text-ace-blue/50">
                                    {formatDuration(day.totalMinutes)}
                                </p>
                            )}
                        </div>

                        {/* Milestones */}
                        {weeklyMilestones[day.day] && (
                            <div className="mb-2 space-y-1">
                                {weeklyMilestones[day.day].map((ms: any, i: number) => (
                                    <div key={i} className={`p-1.5 rounded text-[10px] leading-tight border ${ms.is_completed ? "bg-green-50 border-green-200 text-green-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
                                        <div className="flex items-center gap-1 mb-0.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${ms.is_completed ? "bg-green-500" : "bg-amber-500"}`} />
                                            <span className="font-semibold truncate">{ms.planTitle}</span>
                                        </div>
                                        <span className="block truncate opacity-90">{ms.title}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Study Blocks */}
                        <div className="space-y-1.5 flex-1">
                            {day.blocks.length > 0 ? (
                                day.blocks.map((block, idx) => (
                                    <div
                                        key={`${block.subject}-${idx}`}
                                        className={`rounded-lg p-2 border text-xs ${getSubjectColor(block.subject, block.isEmphasis)}`}
                                    >
                                        <p className="font-medium truncate" title={block.subject}>
                                            {block.isEmphasis && <Star className="h-3 w-3 inline mr-1" />}
                                            {block.subject.length > 10
                                                ? block.subject.substring(0, 10) + "..."
                                                : block.subject}
                                        </p>
                                        <p className="opacity-70">{formatDuration(block.duration)}</p>
                                    </div>
                                ))
                            ) : (
                                !weeklyMilestones[day.day] && <p className="text-xs text-center text-ace-blue/30 py-4">Rest</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Stats Footer */}
            <div className="flex items-center justify-between pt-2 text-sm text-ace-blue/60">
                <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{schedule.totalHours.toFixed(1)} hours total</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {focusItems.map((item) => (
                        <div
                            key={item.subject}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${item.subject === schedule.emphasisSubject
                                ? getSubjectColor(item.subject, true)
                                : getSubjectColor(item.subject)
                                }`}
                        >
                            {item.subject === schedule.emphasisSubject && (
                                <Star className="h-3 w-3" />
                            )}
                            <span className="font-medium">{item.subject}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
