"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Clock, X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveWeeklyFocus } from "@/lib/actions/strategy";

interface FocusItem {
    subject: string;
    hours: number;
}

interface WeeklyFocusEditorProps {
    semester: string;
    initialFocus: FocusItem[];
    availableSubjects: string[];
    onUpdate?: (focus: FocusItem[]) => void;
}

export function WeeklyFocusEditor({
    semester,
    initialFocus,
    availableSubjects,
    onUpdate,
}: WeeklyFocusEditorProps) {
    const [focusItems, setFocusItems] = useState<FocusItem[]>(initialFocus);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [hours, setHours] = useState("2");
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    // Get subjects not already in focus
    const unusedSubjects = availableSubjects.filter(
        (subject) => !focusItems.find((f) => f.subject.toLowerCase() === subject.toLowerCase())
    );

    const handleAddSubject = () => {
        if (!selectedSubject || !hours) return;

        const newItem: FocusItem = {
            subject: selectedSubject,
            hours: parseFloat(hours),
        };

        const updatedFocus = [...focusItems, newItem];
        setFocusItems(updatedFocus);
        onUpdate?.(updatedFocus);

        // Reset and close
        setSelectedSubject("");
        setHours("2");
        setIsDialogOpen(false);

        toast({
            title: "Course Added!",
            description: `${selectedSubject} added to your weekly focus.`,
        });
    };

    const handleRemoveSubject = (subject: string) => {
        const updatedFocus = focusItems.filter((f) => f.subject !== subject);
        setFocusItems(updatedFocus);
        onUpdate?.(updatedFocus);
    };

    const handleUpdateHours = (subject: string, newHours: number) => {
        const updatedFocus = focusItems.map((f) =>
            f.subject === subject ? { ...f, hours: newHours } : f
        );
        setFocusItems(updatedFocus);
        onUpdate?.(updatedFocus);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const result = await saveWeeklyFocus(semester, focusItems);
        setIsSaving(false);

        if (result.success) {
            toast({
                title: "Saved!",
                description: "Your weekly focus has been saved.",
            });
            // Refresh to update the schedule display
            router.refresh();
        } else {
            toast({
                title: "Error",
                description: result.error || "Failed to save.",
                variant: "destructive",
            });
        }
    };

    const totalHours = focusItems.reduce((sum, f) => sum + f.hours, 0);

    return (
        <div className="bg-white p-5 rounded-2xl border border-ace-blue/5 shadow-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-ace-blue" />
                    <h3 className="font-serif text-lg font-semibold text-ace-blue">
                        Weekly Focus
                    </h3>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full gap-1 text-ace-blue hover:bg-ace-blue hover:text-white"
                                disabled={unusedSubjects.length === 0}
                            >
                                <Plus className="h-4 w-4" />
                                Add Course
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add Course to Weekly Focus</DialogTitle>
                                <DialogDescription>
                                    Select a course and set the weekly study hours.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Select Course</Label>
                                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a course..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {unusedSubjects.map((subject) => (
                                                <SelectItem key={subject} value={subject}>
                                                    {subject}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Weekly Hours</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={hours}
                                        onChange={(e) => setHours(e.target.value)}
                                        placeholder="e.g., 3"
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    onClick={handleAddSubject}
                                    disabled={!selectedSubject || !hours}
                                    className="rounded-full bg-ace-blue hover:bg-ace-light"
                                >
                                    Add to Focus
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full gap-1"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        <Save className="h-4 w-4" />
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                </div>
            </div>

            {/* Focus List */}
            {focusItems.length > 0 ? (
                <div className="space-y-2">
                    {focusItems.map((item) => (
                        <div
                            key={item.subject}
                            className="flex items-center justify-between p-3 bg-cream-50 rounded-xl group"
                        >
                            <span className="font-medium text-ace-blue">{item.subject}</span>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <Input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={item.hours}
                                        onChange={(e) =>
                                            handleUpdateHours(item.subject, parseFloat(e.target.value) || 1)
                                        }
                                        className="w-16 h-8 text-center text-sm"
                                    />
                                    <span className="text-sm text-ace-blue/60">hrs</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50"
                                    onClick={() => handleRemoveSubject(item.subject)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {/* Total */}
                    <div className="flex items-center justify-between pt-3 border-t border-ace-blue/10 mt-3">
                        <span className="font-medium text-ace-blue">Total Weekly Hours</span>
                        <span className="font-serif font-bold text-lg text-ace-blue">
                            {totalHours} hrs
                        </span>
                    </div>
                </div>
            ) : (
                <div className="text-center py-6 text-ace-blue/40">
                    <p className="text-sm">No courses in weekly focus yet.</p>
                    <p className="text-xs mt-1">Click "Add Course" to get started.</p>
                </div>
            )}
        </div>
    );
}
