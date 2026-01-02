"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateProfile } from "@/lib/actions/auth";

interface ProfileFormProps {
    currentName: string;
}

export function ProfileForm({ currentName }: ProfileFormProps) {
    const [name, setName] = useState(currentName);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast({ title: "Error", description: "Name cannot be empty.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const result = await updateProfile({ fullName: name.trim() });

            if (result.success) {
                toast({ title: "Profile Updated", description: "Your changes have been saved." });
                router.refresh();
            } else {
                toast({ title: "Error", description: result.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to update profile. Please try again.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="bg-white rounded-3xl border border-ace-blue/10 shadow-sm p-6">
            <h3 className="font-serif text-lg text-ace-blue mb-4">Edit Profile</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="name" className="text-ace-blue/70">
                        Full Name
                    </Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="mt-1 rounded-xl border-ace-blue/20"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={isLoading || name.trim() === currentName}
                    className="w-full rounded-full bg-ace-blue hover:bg-ace-light"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </Button>            </form>
        </div>
    );
}
