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
import { Play, Clock, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logStudySession } from "@/lib/actions/study";
import { useRouter } from "next/navigation";

interface SessionLoggerProps {
    subjects: string[];
}

export function SessionLogger({ subjects }: SessionLoggerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [duration, setDuration] = useState("60");
    const [notes, setNotes] = useState("");
    const [isLogging, setIsLogging] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleLog = async () => {
        if (!selectedSubject || !duration) return;

        setIsLogging(true);
        const result = await logStudySession(
            selectedSubject,
            parseInt(duration, 10),
            notes || undefined
        );
        setIsLogging(false);

        if (result.success) {
            toast({
                title: "Session Logged!",
                description: `${duration} minutes of ${selectedSubject} recorded.`,
            });
            setIsOpen(false);
            setSelectedSubject("");
            setDuration("60");
            setNotes("");
            router.refresh();
        } else {
            toast({
                title: "Error",
                description: result.error,
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full gap-2 text-green-600 border-green-200 hover:bg-green-50 animate-fade-in-up delay-200"
                >
                    <Play className="h-4 w-4" />
                    Log Session
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-ace-blue" />
                        Log Study Session
                    </DialogTitle>
                    <DialogDescription>
                        Record time you spent studying today.
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
                            <option value="">Select a subject...</option>
                            {subjects.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label>Duration (minutes)</Label>
                        <div className="flex gap-2">
                            {[30, 60, 90, 120].map((m) => (
                                <Button
                                    key={m}
                                    type="button"
                                    variant={duration === String(m) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setDuration(String(m))}
                                    className="rounded-full"
                                >
                                    {m}m
                                </Button>
                            ))}
                        </div>
                        <Input
                            type="number"
                            min="5"
                            max="480"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="Custom minutes"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Notes (optional)</Label>
                        <Input
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="What did you cover?"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleLog}
                        disabled={!selectedSubject || !duration || isLogging}
                        className="rounded-full bg-green-600 hover:bg-green-700 gap-2"
                    >
                        <Check className="h-4 w-4" />
                        {isLogging ? "Logging..." : "Log Session"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
