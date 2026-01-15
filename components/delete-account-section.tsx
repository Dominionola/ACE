"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAccount } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DeleteAccountSection() {
    const [isOpen, setIsOpen] = useState(false);
    const [confirmation, setConfirmation] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleDelete = async () => {
        if (confirmation !== "DELETE MY ACCOUNT") {
            toast({
                title: "Confirmation Required",
                description: "Please type 'DELETE MY ACCOUNT' to confirm.",
                variant: "destructive",
            });
            return;
        }

        setIsDeleting(true);
        try {
            const result = await deleteAccount({ confirmation });

            if (result.success) {
                toast({
                    title: "Account Deleted",
                    description: "Your account and all data have been removed.",
                });
                router.push("/login");
            } else {
                toast({
                    title: "Deletion Failed",
                    description: result.error || "Something went wrong.",
                    variant: "destructive",
                });
            }
        } catch {
            toast({
                title: "Deletion Failed",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="border border-red-200 bg-red-50/50 rounded-2xl p-6">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-xl">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                    <h3 className="font-serif text-xl text-red-800 mb-1">
                        Danger Zone
                    </h3>
                    <p className="text-sm text-red-700/70 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                    </p>

                    <Dialog open={isOpen} onOpenChange={(open) => {
                        setIsOpen(open);
                        if (!open) setConfirmation("");
                    }}>                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-100 hover:text-red-700"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Account
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-red-600 flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    Delete Your Account?
                                </DialogTitle>
                                <DialogDescription className="pt-2 space-y-3">
                                    <p>This will permanently delete:</p>
                                    <ul className="list-disc list-inside text-sm space-y-1 text-red-700/80">
                                        <li>All your decks and documents</li>
                                        <li>Quiz and flashcard progress</li>
                                        <li>Grade history and goals</li>
                                        <li>Study sessions and streaks</li>
                                        <li>All XP, badges, and achievements</li>
                                    </ul>
                                    <p className="font-medium text-red-700 pt-2">
                                        Type <code className="bg-red-100 px-1 rounded">DELETE MY ACCOUNT</code> to confirm:
                                    </p>
                                </DialogDescription>
                            </DialogHeader>

                            <Input
                                value={confirmation}
                                onChange={(e) => setConfirmation(e.target.value)}
                                placeholder="DELETE MY ACCOUNT"
                                className="border-red-200 focus:ring-red-500"
                                disabled={isDeleting}
                            />

                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsOpen(false);
                                        setConfirmation("");
                                    }}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleDelete}
                                    disabled={confirmation !== "DELETE MY ACCOUNT" || isDeleting}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Forever
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
