"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { calculateGPA, getGPAClassification, type GradeScale } from "@/lib/utils/gpa";
import { useState } from "react";

interface GradeTrend {
    semester: string;
    subjects: Record<string, number>;
    average: number;
}

interface PerformanceChartProps {
    trends: GradeTrend[];
    subjects: string[];
}

// Color palette matching style guide
const COLORS = [
    "#0A2342", // ace-blue
    "#3B82F6", // ace-accent
    "#2C4A75", // ace-light
    "#059669", // green
    "#D97706", // amber
    "#7C3AED", // purple
    "#DC2626", // red
    "#0891B2", // cyan
];

export function PerformanceChart({ trends, subjects }: PerformanceChartProps) {
    const [gpaScale, setGpaScale] = useState<GradeScale>("4.0");

    if (trends.length === 0) {
        return (
            <div className="text-center py-16 text-ace-blue/40">
                <div className="text-5xl mb-4">📊</div>
                <p className="font-serif text-lg italic">No trend data available yet.</p>
                <p className="text-sm mt-2">Log grades across multiple semesters to see your progress.</p>
            </div>
        );
    }

    // Calculate overall GPA from all grades
    const allGrades = trends.flatMap(t => Object.values(t.subjects).map(v => String(v)));
    const overallGPA = calculateGPA(allGrades, gpaScale);
    const classification = getGPAClassification(overallGPA, gpaScale);

    // Flatten data for Recharts: each semester row has keys for each subject
    const chartData = trends.map(t => ({
        semester: t.semester,
        Average: t.average,
        ...t.subjects,
    }));

    // If only one semester, show bar chart instead
    if (trends.length === 1) {
        const subjectData = subjects
            .filter(s => trends[0].subjects[s] !== undefined)
            .map(s => ({
                subject: s,
                grade: trends[0].subjects[s],
            }));

        return (
            <div className="space-y-4">
                <h3 className="text-lg font-serif font-semibold text-ace-blue">
                    {trends[0].semester} Performance
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={subjectData} layout="vertical" margin={{ left: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis type="number" domain={[0, 100]} tick={{ fill: "#0A2342" }} />
                        <YAxis type="category" dataKey="subject" tick={{ fill: "#0A2342", fontSize: 12 }} width={80} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#FDFBF7",
                                border: "1px solid #0A234220",
                                borderRadius: "12px",
                            }}
                        />
                        <Bar dataKey="grade" fill="#0A2342" radius={[0, 8, 8, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    }

    // Multiple semesters: show line chart with average and per-subject lines
    return (
        <div className="space-y-6">
            {/* GPA Stats Card */}
            <div className="bg-gradient-to-br from-ace-blue to-ace-light p-6 rounded-2xl text-white">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-serif font-semibold">Cumulative GPA</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setGpaScale("4.0")}
                            className={`px-3 py-1 text-xs rounded-full transition-all ${gpaScale === "4.0"
                                    ? "bg-white text-ace-blue font-bold"
                                    : "bg-white/20 hover:bg-white/30"
                                }`}
                        >
                            4.0 Scale
                        </button>
                        <button
                            onClick={() => setGpaScale("5.0")}
                            className={`px-3 py-1 text-xs rounded-full transition-all ${gpaScale === "5.0"
                                    ? "bg-white text-ace-blue font-bold"
                                    : "bg-white/20 hover:bg-white/30"
                                }`}
                        >
                            5.0 Scale
                        </button>
                    </div>
                </div>
                <div className="flex items-end gap-3">
                    <span className="text-5xl font-serif font-bold">{overallGPA.toFixed(2)}</span>
                    <span className="text-lg opacity-80 pb-1">/ {gpaScale}</span>
                </div>
                <p className="mt-2 text-white/80 font-medium">{classification}</p>
            </div>

            {/* Average Trend */}
            <div>
                <h3 className="text-lg font-serif font-semibold text-ace-blue mb-4">
                    Overall Average Trend
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="semester" tick={{ fill: "#0A2342", fontSize: 12 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: "#0A2342" }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#FDFBF7",
                                border: "1px solid #0A234220",
                                borderRadius: "12px",
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="Average"
                            stroke="#0A2342"
                            strokeWidth={3}
                            dot={{ fill: "#0A2342", strokeWidth: 2, r: 5 }}
                            activeDot={{ r: 8 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Per-Subject Trends */}
            {subjects.length > 0 && (
                <div>
                    <h3 className="text-lg font-serif font-semibold text-ace-blue mb-4">
                        Subject Breakdown
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="semester" tick={{ fill: "#0A2342", fontSize: 12 }} />
                            <YAxis domain={[0, 100]} tick={{ fill: "#0A2342" }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#FDFBF7",
                                    border: "1px solid #0A234220",
                                    borderRadius: "12px",
                                }}
                            />
                            <Legend />
                            {subjects.slice(0, 8).map((subject, index) => (
                                <Line
                                    key={subject}
                                    type="monotone"
                                    dataKey={subject}
                                    stroke={COLORS[index % COLORS.length]}
                                    strokeWidth={2}
                                    dot={{ fill: COLORS[index % COLORS.length], r: 4 }}
                                    connectNulls
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
