"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, Plus, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addExam, deleteExam, getExamUrgency, type Exam } from "@/lib/actions/study";
import { useRouter } from "next/navigation";

interface ExamTrackerProps {
    subjects: string[];
    exams: Exam[];
}

export function ExamTracker({ subjects, exams }: ExamTrackerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [examDate, setExamDate] = useState("");
    const [examType, setExamType] = useState("Final");
    const [isAdding, setIsAdding] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleAdd = async () => {
        if (!selectedSubject || !examDate) return;

        setIsAdding(true);
        const result = await addExam(selectedSubject, examDate, examType);
        setIsAdding(false);

        if (result.success) {
            toast({ title: "Exam Added!", description: `${examType} for ${selectedSubject} scheduled.` });
            setIsOpen(false);
            setSelectedSubject("");
            setExamDate("");
            router.refresh();
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
    };

    const handleDelete = async (examId: string) => {
        await deleteExam(examId);
        router.refresh();
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-ace-blue/5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-ace-blue" />
                    <h3 className="font-serif text-lg font-semibold text-ace-blue">
                        Upcoming Exams
                    </h3>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-full gap-1">
                            <Plus className="h-4 w-4" />
                            Add Exam
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add Exam Date</DialogTitle>
                            <DialogDescription>
                                Track upcoming exams to boost study time automatically.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="w-full p-2 border rounded-lg"
                                >
                                    <option value="">Select...</option>
                                    {subjects.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Exam Date</Label>
                                <Input
                                    type="date"
                                    value={examDate}
                                    onChange={(e) => setExamDate(e.target.value)}
                                    min={new Date().toISOString().split("T")[0]}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <div className="flex gap-2">
                                    {["Quiz", "Midterm", "Final"].map((t) => (
                                        <Button
                                            key={t}
                                            type="button"
                                            variant={examType === t ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setExamType(t)}
                                            className="rounded-full"
                                        >
                                            {t}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={handleAdd}
                                disabled={!selectedSubject || !examDate || isAdding}
                                className="rounded-full bg-ace-blue"
                            >
                                {isAdding ? "Adding..." : "Add Exam"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {exams.length > 0 ? (
                <div className="space-y-2">
                    {exams.map((exam) => {
                        const { daysUntil, boost } = getExamUrgency(exam.exam_date);
                        const isUrgent = daysUntil <= 7;

                        return (
                            <div
                                key={exam.id}
                                className={`flex items-center justify-between p-3 rounded-xl ${isUrgent ? "bg-red-50 border border-red-200" : "bg-cream-50"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {isUrgent && <AlertTriangle className="h-4 w-4 text-red-500" />}
                                    <div>
                                        <p className="font-medium text-ace-blue">{exam.subject_name}</p>
                                        <p className="text-xs text-ace-blue/60">
                                            {exam.exam_type} • {new Date(exam.exam_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-medium ${isUrgent ? "text-red-600" : "text-ace-blue/60"}`}>
                                        {daysUntil} days
                                        {boost > 1 && (
                                            <span className="ml-1 text-xs">+{Math.round((boost - 1) * 100)}%</span>
                                        )}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-400 hover:text-red-600"
                                        onClick={() => handleDelete(exam.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-center py-4 text-ace-blue/40 text-sm">
                    No upcoming exams. Add one to boost study time automatically!
                </p>
            )}
        </div>
    );
}
