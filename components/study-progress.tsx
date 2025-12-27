"use client";

import { Clock, TrendingUp } from "lucide-react";

interface StudyProgressProps {
    plannedMinutes: number;
    completedMinutes: number;
    bySubject: Record<string, number>;
}

export function StudyProgress({ plannedMinutes, completedMinutes, bySubject }: StudyProgressProps) {
    const percentage = plannedMinutes > 0
        ? Math.min(100, Math.round((completedMinutes / plannedMinutes) * 100))
        : 0;

    const completedHours = (completedMinutes / 60).toFixed(1);
    const plannedHours = (plannedMinutes / 60).toFixed(1);

    // Dynamic Color Logic
    const now = new Date();
    const dayIndex = now.getDay() || 7; // Mon=1, Sun=7
    const hoursPassed = (dayIndex - 1) * 24 + now.getHours();
    const weekProgress = Math.min(100, (hoursPassed / (7 * 24)) * 100);

    // Status Determination
    // If progress is > 10% behind schedule -> Warning
    // If progress is > 30% behind schedule -> Behind
    const diff = percentage - weekProgress;
    let status: "healthy" | "warning" | "behind" = "healthy";

    if (diff < -30) status = "behind";
    else if (diff < -10) status = "warning";

    const themes = {
        healthy: {
            bg: "bg-gradient-to-r from-green-50 to-emerald-50",
            border: "border-green-100",
            icon: "text-green-600",
            text: "text-green-800",
            percentage: "text-green-600",
            barBg: "bg-green-100",
            barFill: "bg-gradient-to-r from-green-400 to-emerald-500",
            subtext: "text-green-700",
            borderTop: "border-green-100",
            pill: "text-green-700 border-green-200",
            label: "text-green-600"
        },
        warning: {
            bg: "bg-gradient-to-r from-orange-50 to-amber-50",
            border: "border-orange-100",
            icon: "text-orange-500",
            text: "text-orange-800",
            percentage: "text-orange-600",
            barBg: "bg-orange-100",
            barFill: "bg-gradient-to-r from-orange-400 to-amber-500",
            subtext: "text-orange-700",
            borderTop: "border-orange-100",
            pill: "text-orange-700 border-orange-200",
            label: "text-orange-600"
        },
        behind: {
            // Soft rose/red as requested to not be discouraging
            bg: "bg-gradient-to-r from-rose-50 to-pink-50",
            border: "border-rose-100",
            icon: "text-rose-500",
            text: "text-rose-800",
            percentage: "text-rose-600",
            barBg: "bg-rose-100",
            barFill: "bg-gradient-to-r from-rose-400 to-pink-400",
            subtext: "text-rose-700",
            borderTop: "border-rose-100",
            pill: "text-rose-700 border-rose-200",
            label: "text-rose-600"
        }
    };

    const t = themes[status];

    return (
        <div className={`${t.bg} p-4 rounded-2xl border ${t.border} transition-colors duration-500`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <TrendingUp className={`h-5 w-5 ${t.icon}`} />
                    <h4 className={`font-serif font-semibold ${t.text}`}>This Week's Progress</h4>
                </div>
                <span className={`text-2xl font-bold ${t.percentage}`}>{percentage}%</span>
            </div>

            {/* Progress Bar */}
            <div className={`h-3 ${t.barBg} rounded-full overflow-hidden mb-2`}>
                <div
                    className={`h-full ${t.barFill} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <p className={`text-sm ${t.subtext}`}>
                <Clock className="h-3.5 w-3.5 inline mr-1" />
                {completedHours} / {plannedHours} hours completed
            </p>

            {/* Subject breakdown */}
            {Object.keys(bySubject).length > 0 && (
                <div className={`mt-3 pt-3 border-t ${t.borderTop}`}>
                    <p className={`text-xs ${t.label} mb-2 font-medium`}>By Subject:</p>
                    <div className="flex flex-wrap gap-1">
                        {Object.entries(bySubject).slice(0, 5).map(([subject, mins]) => (
                            <span
                                key={subject}
                                className={`px-2 py-0.5 bg-white ${t.pill} text-xs rounded-full border`}
                            >
                                {subject}: {Math.round(mins / 60 * 10) / 10}h
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
