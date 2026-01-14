"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface StreakFlameProps {
    days: number;
    className?: string;
}

export function StreakFlame({ days, className }: StreakFlameProps) {
    const isActive = days > 0;
    const isFire = days >= 3;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn("flex items-center gap-1.5 cursor-help", className)}>
                        <div className="relative">
                            <motion.div
                                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            >
                                <Flame
                                    className={cn(
                                        "h-5 w-5 transition-all duration-300",
                                        isActive ? "text-orange-500 fill-orange-500" : "text-gray-300",
                                        isFire && "drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                                    )}
                                />
                            </motion.div>
                            {isFire && (
                                <motion.div
                                    className="absolute inset-0 text-yellow-400 opacity-50 blur-sm"
                                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    <Flame className="h-5 w-5 fill-yellow-400" />
                                </motion.div>
                            )}
                        </div>
                        <span className={cn(
                            "font-bold font-serif text-lg",
                            isActive ? "text-orange-600" : "text-gray-400"
                        )}>
                            {days}
                        </span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{days} Day Streak! {days === 0 && "Start learning today!"}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
