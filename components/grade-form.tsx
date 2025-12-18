"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GradeHistorySchema, type GradeHistoryInput } from "@/lib/schemas/grade";
import { logGrade } from "@/lib/actions/grade";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Combobox } from "@/components/ui/combobox";

interface GradeFormProps {
    subjects: { value: string; label: string }[];
}

export function GradeForm({ subjects }: GradeFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const form = useForm<GradeHistoryInput>({
        resolver: zodResolver(GradeHistorySchema),
        defaultValues: {
            subject_name: "",
            grade_value: "",
            semester: "",
        }
    });

    const onSubmit = async (data: GradeHistoryInput) => {
        setIsSubmitting(true);
        const result = await logGrade(data);
        setIsSubmitting(false);

        if (result.success) {
            toast({ title: "Success", description: "Grade logged successfully" });
            form.reset();
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border p-4 rounded-xl bg-white/50 backdrop-blur-sm">
            <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Combobox
                    options={subjects}
                    value={form.watch("subject_name")}
                    onChange={(val) => form.setValue("subject_name", val)}
                    placeholder="Select or type subject..."
                    searchPlaceholder="Search subject..."
                    allowCustom
                />
                {form.formState.errors.subject_name && <p className="text-red-500 text-xs">{form.formState.errors.subject_name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="grade">Grade Achieved</Label>
                    <Input id="grade" placeholder="e.g. 92 or A" {...form.register("grade_value")} />
                    {form.formState.errors.grade_value && <p className="text-red-500 text-xs">{form.formState.errors.grade_value.message}</p>}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="semester">Semester/Term</Label>
                    <Input id="semester" placeholder="e.g. Fall 2024" {...form.register("semester")} />
                    {form.formState.errors.semester && <p className="text-red-500 text-xs">{form.formState.errors.semester.message}</p>}
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Log Grade"}
            </Button>
        </form>
    );
}
