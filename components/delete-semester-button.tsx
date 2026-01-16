"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteSemester } from "@/lib/actions/grade";
import { useToast } from "@/hooks/use-toast";

interface DeleteSemesterButtonProps {
    semester: string;
}

export function DeleteSemesterButton({ semester }: DeleteSemesterButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleDelete = async () => {
        setIsLoading(true);
        const result = await deleteSemester(semester);

        if (result.success) {
            toast({
                title: "Semester Deleted",
                description: `All data for "${semester}" has been removed.`,
            });
            router.push("/dashboard/grades");
        } else {
            toast({
                title: "Error",
                description: result.error || "Failed to delete semester",
                variant: "destructive",
            });
        }
        setIsLoading(false);
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Semester
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 rounded-full">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <AlertDialogTitle>Delete "{semester}"?</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-left">
                        This will permanently delete:
                        <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                            <li>All grades logged for this semester</li>
                            <li>Auto-generated study decks</li>
                            <li>AI study strategies</li>
                            <li>Weekly focus plans</li>
                        </ul>
                        <p className="mt-3 font-medium text-red-600">This action cannot be undone.</p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isLoading ? "Deleting..." : "Delete Semester"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
