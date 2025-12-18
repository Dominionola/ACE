"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2, Check, X } from "lucide-react";
import { bulkLogGrades, bulkSetGoals } from "@/lib/actions/grade";
import { useToast } from "@/hooks/use-toast";

interface ExtractedGrade {
    subject_name: string;
    grade: string;
}

interface BulkGradeReviewProps {
    isOpen: boolean;
    onClose: () => void;
    data: ExtractedGrade[];
    mode: "history" | "goals";
}

export function BulkGradeReview({ isOpen, onClose, data, mode }: BulkGradeReviewProps) {
    const [grades, setGrades] = useState(data);
    const [semester, setSemester] = useState("Fall 2024");
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    // Reset when data changes
    if (data !== grades && data.length > 0 && grades.length === 0) {
        setGrades(data);
    }

    const handleUpdate = (idx: number, field: keyof ExtractedGrade, value: string) => {
        const newGrades = [...grades];
        newGrades[idx] = { ...newGrades[idx], [field]: value };
        setGrades(newGrades);
    };

    const handleRemove = (idx: number) => {
        setGrades(grades.filter((_, i) => i !== idx));
    };

    const handleSave = async () => {
        setIsSaving(true);
        let result;

        if (mode === "history") {
            result = await bulkLogGrades(grades.map(g => ({
                subject_name: g.subject_name,
                grade_value: g.grade,
                semester: semester
            })));
        } else {
            result = await bulkSetGoals(grades.map(g => ({
                subject_name: g.subject_name,
                target_grade: g.grade
            })));
        }

        setIsSaving(false);

        if (result.success) {
            toast({ title: "Saved Successfully", description: `Added ${grades.length} items to your ${mode}.` });
            onClose();
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* Style Guide: Cream background, rounded-3xl for cards */}
            <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto bg-cream-50 rounded-3xl border-border/50 shadow-xl">
                <DialogHeader>
                    {/* Style Guide: Serif font for headings, Ace Blue color */}
                    <DialogTitle className="font-serif text-2xl text-ace-blue">Review Extracted Data</DialogTitle>
                    <DialogDescription className="text-ace-blue/70">
                        The AI found the following subjects. Please verify before saving.
                    </DialogDescription>
                </DialogHeader>

                {mode === "history" && (
                    <div className="grid gap-2 mb-4">
                        <Label htmlFor="semester" className="text-ace-blue font-bold tracking-wide uppercase text-xs">Semester</Label>
                        <Input
                            id="semester"
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            placeholder="e.g. Fall 2024"
                            className="rounded-xl border-ace-blue/20 focus:border-ace-blue bg-white"
                        />
                    </div>
                )}

                <div className="space-y-3 py-2">
                    {grades.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 border border-ace-blue/10 rounded-2xl bg-white shadow-sm transition-all hover:shadow-md">
                            <div className="grid gap-1 flex-1">
                                <Input
                                    value={item.subject_name}
                                    onChange={(e) => handleUpdate(idx, "subject_name", e.target.value)}
                                    className="h-9 text-sm font-medium border-transparent bg-transparent hover:bg-cream-50 focus:bg-white transition-colors"
                                    placeholder="Subject"
                                />
                            </div>
                            <div className="w-24">
                                <Input
                                    value={item.grade}
                                    onChange={(e) => handleUpdate(idx, "grade", e.target.value)}
                                    className="h-9 text-sm font-bold text-ace-blue text-center border-ace-blue/10 bg-cream-50 rounded-lg"
                                    placeholder="Grade"
                                />
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-ace-blue/40 hover:text-red-500 hover:bg-red-50 rounded-full"
                                onClick={() => handleRemove(idx)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {grades.length === 0 && (
                        <div className="text-center py-8 opacity-60">
                            <p className="font-serif text-ace-blue text-lg italic">No data to review.</p>
                            <p className="text-sm text-ace-blue/60 mt-1">Try uploading a clearer image.</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-3 sm:gap-2 pt-4">
                    {/* Style Guide: Secondary Button */}
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="rounded-full border-ace-blue/20 text-ace-blue hover:bg-ace-blue/5"
                    >
                        Cancel
                    </Button>
                    {/* Style Guide: Primary Button */}
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || grades.length === 0}
                        className="rounded-full bg-ace-blue text-white hover:bg-ace-light shadow-lg hover:shadow-xl transition-all"
                    >
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save as {mode === "history" ? "Grades" : "Goals"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
