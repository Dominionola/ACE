"use client";

import { Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteGrade } from "@/lib/actions/grade";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface GradeListProps {
    grades: any[];
    goals: any[];
}

export function GradeList({ grades, goals }: GradeListProps) {
    const { toast } = useToast();

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

    if (grades.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
                <p>No grades logged yet.</p>
                <p className="text-sm">Start by adding your recent results above.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {grades.map((grade) => {
                const goal = getGoal(grade.subject_name);
                // Simple comparison logic (assuming numeric or exact string match for now)
                // Real implementation might need smarter parsing (e.g. A vs A-)
                // For now: string equality or numeric comparison if possible.

                let status = "neutral";
                if (goal) {
                    if (grade.grade_value === goal.target_grade) status = "met";
                    // Try parsing numbers
                    const gradeNum = parseFloat(grade.grade_value);
                    const goalNum = parseFloat(goal.target_grade);
                    if (!isNaN(gradeNum) && !isNaN(goalNum)) {
                        if (gradeNum >= goalNum) status = "met";
                        else status = "missed";
                    }
                }

                return (
                    <div key={grade.id} className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">{grade.subject_name}</h4>
                                <Badge variant="outline" className="text-xs text-muted-foreground font-normal">
                                    {grade.semester}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-2xl font-bold text-ace-blue">{grade.grade_value}</span>
                                {goal && (
                                    <span className="text-sm text-gray-500 flex items-center gap-1">
                                        / Target: <span className="font-medium">{goal.target_grade}</span>
                                        {status === "met" && <CheckCircle className="h-3 w-3 text-green-500" />}
                                        {status === "missed" && <AlertCircle className="h-3 w-3 text-amber-500" />}
                                    </span>
                                )}
                            </div>
                        </div>

                        <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(grade.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            })}
        </div>
    );
}
