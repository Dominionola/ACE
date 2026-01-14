"use client";

import { useState, useEffect } from "react";
import { getCoachingPrompt } from "@/lib/actions/coaching";
import { CoachingPrompt } from "@/lib/coaching/engine";
import { Button } from "@/components/ui/button";
import { X, Lightbulb, GraduationCap, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function CoachPrompt() {
    const [prompt, setPrompt] = useState<CoachingPrompt | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const pathname = usePathname();

    // Only show on dashboard routes (authenticated area)
    const isDashboardRoute = pathname.startsWith("/dashboard");
    // Don't show on specific pages (e.g. while taking a quiz)
    const isRestrictedPage = pathname.includes("/study/") || pathname.includes("/quiz/");

    useEffect(() => {
        // Only run on dashboard routes, not restricted pages
        if (!isDashboardRoute || isRestrictedPage) {
            setIsVisible(false);
            return;
        }

        const checkCoach = async () => {
            const result = await getCoachingPrompt();
            if (result) {
                setPrompt(result);
                setIsVisible(true);
            }
        };

        // Check on mount and periodically
        checkCoach();
        const interval = setInterval(checkCoach, 5 * 60 * 1000); // Every 5 mins

        return () => clearInterval(interval);
    }, [pathname, isDashboardRoute, isRestrictedPage]);

    const handleDismiss = () => {
        setIsVisible(false);
        // TODO: Call server action to dismiss/snooze
    };

    if (!prompt || !isVisible) return null;

    const getIcon = () => {
        switch (prompt.type) {
            case 'exam_upcoming': return <GraduationCap className="h-5 w-5 text-purple-600" />;
            case 'study_streak': return <Flame className="h-5 w-5 text-orange-600" />;
            default: return <Lightbulb className="h-5 w-5 text-ace-blue" />;
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="fixed bottom-6 right-6 z-50 max-w-sm w-full"
                >
                    <div className="bg-white rounded-2xl shadow-xl border border-ace-blue/10 p-4 relative overflow-hidden">
                        {/* Decorative accent */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-400 to-ace-blue" />

                        <div className="flex gap-3 pl-2">
                            <div className="mt-1 bg-gray-50 p-2 rounded-full h-fit">
                                {getIcon()}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-serif font-medium text-ace-blue text-sm mb-1">
                                    Study Coach
                                </h4>
                                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                    {prompt.message}
                                </p>

                                <div className="flex gap-2">
                                    {prompt.actionLabel && prompt.actionUrl && (
                                        <Link href={prompt.actionUrl} className="flex-1" onClick={handleDismiss}>
                                            <Button size="sm" className="w-full text-xs rounded-full bg-ace-blue hover:bg-ace-light text-white h-8">
                                                {prompt.actionLabel}
                                            </Button>
                                        </Link>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-xs text-gray-400 hover:text-gray-600 h-8 px-2"
                                        onClick={handleDismiss}
                                    >
                                        Dismiss
                                    </Button>
                                </div>
                            </div>
                            <button
                                onClick={handleDismiss}
                                className="absolute top-2 right-2 text-gray-300 hover:text-gray-500"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
