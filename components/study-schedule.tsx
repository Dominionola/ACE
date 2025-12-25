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

interface StudyScheduleProps {
    focusItems: FocusItem[];
    studyDays?: number[];
}

export function StudySchedule({ focusItems, studyDays = [0, 1, 2, 3, 4] }: StudyScheduleProps) {
    const currentWeek = getWeekNumber();
    const [selectedWeek, setSelectedWeek] = useState(currentWeek);

    const schedule = useMemo(
        () => generateWeeklySchedule(focusItems, studyDays, 6, selectedWeek),
        [focusItems, studyDays, selectedWeek]
    );

    if (focusItems.length === 0) {
        return (
            <div className="text-center py-8 text-ace-blue/40">
                <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="font-serif italic">No weekly focus set yet.</p>
                <p className="text-sm mt-1">Add courses to your weekly focus to generate a schedule.</p>
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
                        className={`rounded-xl p-3 min-h-[140px] transition-all ${day.blocks.length > 0
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

                        {/* Study Blocks */}
                        <div className="space-y-1.5">
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
                                <p className="text-xs text-center text-ace-blue/30 py-4">Rest</p>
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
