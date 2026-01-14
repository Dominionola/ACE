"use client";

import { BADGES } from "@/lib/gamification";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface BadgeListProps {
    earnedBadges: string[]; // List of badge codes
}

export function BadgeList({ earnedBadges }: BadgeListProps) {
    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            <TooltipProvider>
                {BADGES.map((badge) => {
                    const isEarned = earnedBadges.includes(badge.code);

                    return (
                        <Tooltip key={badge.code}>
                            <TooltipTrigger asChild>
                                <div className={cn(
                                    "aspect-square rounded-2xl flex flex-col items-center justify-center p-2 gap-1 border-2 transition-all",
                                    isEarned
                                        ? "bg-amber-50 border-amber-200 shadow-sm"
                                        : "bg-gray-50 border-gray-100 opacity-60 grayscale"
                                )}>
                                    <div className="text-2xl mb-1">
                                        {isEarned ? badge.icon : <Lock className="h-6 w-6 text-gray-300" />}
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-bold text-center leading-tight",
                                        isEarned ? "text-amber-900" : "text-gray-400"
                                    )}>
                                        {badge.name}
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-center">
                                    <p className="font-bold">{badge.name}</p>
                                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                                    {!isEarned && <p className="text-[10px] text-red-400 mt-1 font-medium">Locked</p>}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </TooltipProvider>
        </div>
    );
}
