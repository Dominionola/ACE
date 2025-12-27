"use client";

import { useState } from "react";
import React from "react";
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
import { Plus, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createCard } from "@/lib/actions/card";
import { useRouter } from "next/navigation";

interface FlashcardFormProps {
    deckId: string;
    trigger?: React.ReactNode;
}

export function FlashcardForm({ deckId, trigger }: FlashcardFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [front, setFront] = useState("");
    const [back, setBack] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleSubmit = async (addAnother: boolean = false) => {
        if (!front || !back) return;

        setIsSubmitting(true);
        const result = await createCard(deckId, front, back);
        setIsSubmitting(false);

        if (result.success) {
            toast({
                title: "Card Created",
                description: "Flashcard added to deck.",
            });
            setFront("");
            setBack("");

            if (!addAnother) {
                setIsOpen(false);
            }
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
                {trigger || (
                    <Button className="rounded-full gap-2 bg-ace-blue text-white hover:bg-ace-light transition-all shadow-lg hover:shadow-xl">
                        <Plus strokeWidth={1.5} className="h-5 w-5" />
                        Add Card
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Flashcard</DialogTitle>
                    <DialogDescription>
                        Create a card for active recall. Keep it concise.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Front (Question/Term)</Label>
                        <Textarea
                            value={front}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFront(e.target.value)}
                            placeholder="e.g., What is the powerhouse of the cell?"
                            className="bg-ace-blue/5 border-0 focus-visible:ring-1 focus-visible:ring-ace-blue/20"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Back (Answer/Definition)</Label>
                        <Textarea
                            value={back}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBack(e.target.value)}
                            placeholder="e.g., Mitochondria"
                            className="bg-ace-blue/5 border-0 focus-visible:ring-1 focus-visible:ring-ace-blue/20"
                        />
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handleSubmit(true)}
                        disabled={!front || !back || isSubmitting}
                        className="rounded-full flex-1"
                    >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Save & Add Another
                    </Button>
                    <Button
                        onClick={() => handleSubmit(false)}
                        disabled={!front || !back || isSubmitting}
                        className="rounded-full flex-1 bg-ace-blue hover:bg-ace-light"
                    >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                        Save & Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
