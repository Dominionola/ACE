"use client";

import { Trash2, AlertCircle, CheckCircle, ChevronDown, Target, Pencil, Check, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteGrade, setSubjectGoal } from "@/lib/actions/grade";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface GradeListProps {
    grades: any[];
    goals: any[];
    semesters: string[];
}

export function GradeList({ grades, goals, semesters }: GradeListProps) {
    const { toast } = useToast();
    const [editingGoal, setEditingGoal] = useState<string | null>(null);
    const [goalValue, setGoalValue] = useState("");

    // Helper to find goal
    const getGoal = (subject: string) => goals.find(g => g.subject_name.toLowerCase() === subject.toLowerCase());

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this grade?")) return;

        const result = await deleteGrade(id);
        if (result.success) {
            toast({ title: "Deleted", description: "Grade removed." });
        } else {
            toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
        }
    };

    const handleSetGoal = async (subjectName: string) => {
        if (!goalValue.trim()) {
            setEditingGoal(null);
            return;
        }

        const result = await setSubjectGoal({ subject_name: subjectName, target_grade: goalValue });
        if (result.success) {
            toast({ title: "Goal Set!", description: `Target for ${subjectName} set to ${goalValue}` });
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
        setEditingGoal(null);
        setGoalValue("");
    };

    // Group grades by semester
    const groupedGrades = grades.reduce((acc, grade) => {
        const semester = grade.semester || "No Semester";
        if (!acc[semester]) acc[semester] = [];
        acc[semester].push(grade);
        return acc;
    }, {} as Record<string, any[]>);

    // Sort semesters (most recent first - simple string sort works for "Fall 2024" format)
    const sortedSemesters = Object.keys(groupedGrades).sort().reverse();

    if (grades.length === 0) {
        return (
            <div className="text-center py-16 text-ace-blue/50 border-2 border-dashed border-ace-blue/10 rounded-3xl bg-cream-50">
                <p className="font-serif text-xl italic">No grades logged yet.</p>
                <p className="text-sm mt-2">Upload a report card or add results manually.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {sortedSemesters.map((semester) => (
                <Collapsible key={semester} defaultOpen className="group">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-cream-100 hover:bg-cream-200/70 rounded-2xl transition-colors border border-ace-blue/5">
                        <div className="flex items-center gap-3">
                            <span className="font-serif text-lg font-semibold text-ace-blue">{semester}</span>
                            <Badge variant="outline" className="bg-white text-xs font-medium">
                                {groupedGrades[semester].length} subjects
                            </Badge>
                            <Link
                                href={`/dashboard/grades/${encodeURIComponent(semester)}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-ace-blue/40 hover:text-ace-accent transition-colors"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </Link>
                        </div>
                        <ChevronDown className="h-5 w-5 text-ace-blue/50 group-data-[state=open]:rotate-180 transition-transform" />
                    </CollapsibleTrigger>

                    <CollapsibleContent className="mt-2 space-y-2 pl-2">
                        {groupedGrades[semester].map((grade: any) => {
                            const goal = getGoal(grade.subject_name);
                            const isEditing = editingGoal === grade.id;

                            let status = "neutral";
                            if (goal) {
                                const gradeNum = parseFloat(grade.grade_value);
                                const goalNum = parseFloat(goal.target_grade);
                                if (!isNaN(gradeNum) && !isNaN(goalNum)) {
                                    status = gradeNum >= goalNum ? "met" : "missed";
                                } else if (grade.grade_value === goal.target_grade) {
                                    status = "met";
                                }
                            }

                            return (
                                <div
                                    key={grade.id}
                                    className="flex items-center justify-between p-4 bg-white border border-ace-blue/5 rounded-xl shadow-sm hover:shadow-md transition-all group/item"
                                >
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-ace-blue">{grade.subject_name}</h4>

                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-2xl font-bold text-ace-blue font-serif">{grade.grade_value}</span>

                                            {/* Goal Display/Edit Section */}
                                            {isEditing ? (
                                                <div className="flex items-center gap-2 ml-2">
                                                    <Input
                                                        value={goalValue}
                                                        onChange={(e) => setGoalValue(e.target.value)}
                                                        placeholder="Target"
                                                        className="w-20 h-8 text-sm"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") handleSetGoal(grade.subject_name);
                                                            if (e.key === "Escape") setEditingGoal(null);
                                                        }}
                                                    />
                                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600 hover:bg-green-50" onClick={() => handleSetGoal(grade.subject_name)}>
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-gray-400 hover:bg-gray-100" onClick={() => setEditingGoal(null)}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : goal ? (
                                                <button
                                                    className="flex items-center gap-1.5 text-sm text-ace-blue/60 hover:text-ace-blue ml-2 transition-colors"
                                                    onClick={() => { setEditingGoal(grade.id); setGoalValue(goal.target_grade); }}
                                                >
                                                    <Target className="h-3.5 w-3.5" />
                                                    <span className="font-medium">{goal.target_grade}</span>
                                                    {status === "met" && <CheckCircle className="h-4 w-4 text-green-600 ml-1" />}
                                                    {status === "missed" && <AlertCircle className="h-4 w-4 text-amber-500 ml-1" />}
                                                    <Pencil className="h-3 w-3 opacity-0 group-hover/item:opacity-50 ml-1" />
                                                </button>
                                            ) : (
                                                <button
                                                    className="flex items-center gap-1.5 text-xs text-ace-blue/40 hover:text-ace-accent ml-2 transition-colors opacity-0 group-hover/item:opacity-100"
                                                    onClick={() => { setEditingGoal(grade.id); setGoalValue(""); }}
                                                >
                                                    <Target className="h-3.5 w-3.5" />
                                                    <span>Set Goal</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity"
                                        onClick={() => handleDelete(grade.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            );
                        })}
                    </CollapsibleContent>
                </Collapsible>
            ))}
        </div>
    );
}
