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
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateStudyPlan } from "@/lib/actions/plans";
import { useToast } from "@/hooks/use-toast";

export function GoalSetter() {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date>();
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    async function onSubmit(formData: FormData) {
        if (!date) {
            toast({
                title: "Date required",
                description: "Please select a target date for your goal.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const topics = (formData.get("topics") as string).split(",").map(t => t.trim());

        const result = await generateStudyPlan({
            title,
            description,
            targetDate: date.toISOString(),
            topics,
        });

        setIsLoading(false);

        if (result.success) {
            toast({
                title: "Plan created!",
                description: "Your Al-generated study plan is ready.",
            });
            setOpen(false);
        } else {
            toast({
                title: "Error",
                description: result.error || "Failed to create plan",
                variant: "destructive",
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-full bg-ace-blue hover:bg-ace-light text-white">
                    Set New Goal
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form action={onSubmit}>
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl text-ace-blue">Set a Study Goal</DialogTitle>
                        <DialogDescription>
                            Tell us what you want to achieve and by when. We'll generate a roadmap for you.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title" className="text-ace-blue">Goal Title</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="e.g. Ace Calculus Final"
                                className="col-span-3 rounded-xl border-ace-blue/20"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description" className="text-ace-blue">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Specific details about the exam or goal..."
                                className="col-span-3 rounded-xl border-ace-blue/20"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="topics" className="text-ace-blue">Key Topics</Label>
                            <Input
                                id="topics"
                                name="topics"
                                placeholder="Limits, Derivatives, Integrals (comma separated)"
                                className="col-span-3 rounded-xl border-ace-blue/20"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-ace-blue">Target Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal rounded-xl border-ace-blue/20",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                        disabled={(date) => date < new Date()}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-full bg-ace-blue hover:bg-ace-light text-white"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating Plan...
                                </>
                            ) : (
                                "Create Plan"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
