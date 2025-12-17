"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubjectGoalSchema, type SubjectGoalInput } from "@/lib/schemas/grade";
import { setSubjectGoal } from "@/lib/actions/grade";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function GoalForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const form = useForm<SubjectGoalInput>({
        resolver: zodResolver(SubjectGoalSchema),
        defaultValues: {
            subject_name: "",
            target_grade: "",
        }
    });

    const onSubmit = async (data: SubjectGoalInput) => {
        setIsSubmitting(true);
        const result = await setSubjectGoal(data);
        setIsSubmitting(false);

        if (result.success) {
            toast({ title: "Goal Set!", description: `Target for ${data.subject_name} saved.` });
            form.reset();
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border p-4 rounded-xl bg-blue-50/50">
            <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-lg text-blue-800">Set Grade Goal</h3>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="goal-subject">Subject</Label>
                <Input id="goal-subject" placeholder="e.g. Physics" {...form.register("subject_name")} />
                {form.formState.errors.subject_name && <p className="text-red-500 text-xs">{form.formState.errors.subject_name.message}</p>}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="target">Target Grade</Label>
                <Input id="target" placeholder="e.g. A+" {...form.register("target_grade")} />
                {form.formState.errors.target_grade && <p className="text-red-500 text-xs">{form.formState.errors.target_grade.message}</p>}
            </div>

            <Button type="submit" variant="secondary" className="w-full text-blue-700 bg-blue-100 hover:bg-blue-200" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Save Goal"}
            </Button>
        </form>
    );
}
