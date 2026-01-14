"use client";

import { Progress } from "@/components/ui/progress";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";

interface XPBarProps {
    xp: number;
    level: number;
}

export function XPBar({ xp, level }: XPBarProps) {
    // Formula: Level = sqrt(XP / 100) + 1
    // Reverse: XP needed for Level L = ((L - 1)^2) * 100

    const currentLevelBaseXP = Math.pow(level - 1, 2) * 100;
    const nextLevelBaseXP = Math.pow(level, 2) * 100;
    const xpNeededForNextLevel = nextLevelBaseXP - currentLevelBaseXP;
    const currentProgressXP = xp - currentLevelBaseXP;

    // Safety check just in case
    const safeProgressXP = Math.max(0, currentProgressXP);
    const safeTotalNeeded = Math.max(1, xpNeededForNextLevel);

    const percentage = Math.min(100, Math.round((safeProgressXP / safeTotalNeeded) * 100));

    return (
        <div className="w-full space-y-2">
            <div className="flex justify-between items-end text-sm">
                <div className="flex items-center gap-1.5 font-bold text-ace-blue">
                    <div className="bg-ace-accent text-white w-6 h-6 rounded-md flex items-center justify-center text-xs shadow-sm">
                        {level}
                    </div>
                    <span>Level {level}</span>
                </div>
                <div className="text-xs text-ace-blue/60 font-medium">
                    {safeProgressXP} / {safeTotalNeeded} XP
                </div>
            </div>

            <div className="relative">
                <Progress value={percentage} className="h-3 rounded-full bg-ace-blue/10" />
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 right-0 pointer-events-none"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                >
                </motion.div>
            </div>
        </div>
    );
}
