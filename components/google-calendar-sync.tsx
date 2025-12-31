"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { syncScheduleToGoogle } from "@/lib/actions/calendar";
import { WeeklySchedule } from "@/lib/utils/schedule";
import { Calendar, Loader2, CheckCircle, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface GoogleCalendarSyncProps {
    schedule: WeeklySchedule;
}

export function GoogleCalendarSync({ schedule }: GoogleCalendarSyncProps) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const supabase = createClient();

    const handleConnect = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                scopes: "https://www.googleapis.com/auth/calendar",
                redirectTo: `${window.location.origin}/dashboard/grades`, // Return to grades page
            },
        });

        if (error) {
            toast({
                title: "Connection Failed",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        const result = await syncScheduleToGoogle(schedule);
        setIsSyncing(false);

        if (result.success) {
            toast({
                title: "Sycnronization Complete",
                description: `Successfully added ${result.count} study blocks to your calendar.`,
            });
            setIsOpen(false);
        } else {
            // Check for specific auth error to encourage reconnection
            if (result.error?.includes("Authentication") || result.error?.includes("expired")) {
                toast({
                    title: "Authentication Required",
                    description: "Please connect your Google Calendar first.",
                    variant: "destructive",
                    action: <Button variant="outline" size="sm" onClick={handleConnect}>Connect</Button>
                });
            } else {
                toast({
                    title: "Sync Failed",
                    description: result.error || "Could not sync schedule.",
                    variant: "destructive",
                });
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="ml-2 gap-2 h-8 rounded-full text-ace-blue/70 hover:text-ace-blue border-ace-blue/20">
                    <Calendar className="h-3.5 w-3.5" />
                    Sync to Google
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-serif text-xl text-ace-blue">
                        <Calendar className="h-5 w-5" />
                        Google Calendar Sync
                    </DialogTitle>
                    <DialogDescription>
                        Add your study schedule to your text Google Calendar.
                        Events will be created starting at 6:00 PM for each study day.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                        <RefreshCcw className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-semibold mb-1">One-Way Sync</p>
                            <p>This will add <strong>{schedule.days.reduce((acc, d) => acc + d.blocks.length, 0)} events</strong> to your primary calendar.</p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={handleConnect} className="w-full sm:w-auto">
                        Connect / Re-Auth
                    </Button>
                    <Button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="w-full sm:w-auto bg-ace-blue text-white hover:bg-ace-light rounded-full"
                    >
                        {isSyncing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Syncing...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Sync Now
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
