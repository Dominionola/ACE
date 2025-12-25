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

    return (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <h4 className="font-serif font-semibold text-green-800">This Week's Progress</h4>
                </div>
                <span className="text-2xl font-bold text-green-600">{percentage}%</span>
            </div>

            {/* Progress Bar */}
            <div className="h-3 bg-green-100 rounded-full overflow-hidden mb-2">
                <div
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <p className="text-sm text-green-700">
                <Clock className="h-3.5 w-3.5 inline mr-1" />
                {completedHours} / {plannedHours} hours completed
            </p>

            {/* Subject breakdown */}
            {Object.keys(bySubject).length > 0 && (
                <div className="mt-3 pt-3 border-t border-green-100">
                    <p className="text-xs text-green-600 mb-2 font-medium">By Subject:</p>
                    <div className="flex flex-wrap gap-1">
                        {Object.entries(bySubject).slice(0, 5).map(([subject, mins]) => (
                            <span
                                key={subject}
                                className="px-2 py-0.5 bg-white text-green-700 text-xs rounded-full border border-green-200"
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
