"use client";

import { useEffect, useState } from "react";
import { getUserStats } from "@/lib/actions/gamification";
import { TrendingUp, Flame, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function StreakCounter() {
    const [streak, setStreak] = useState<number | null>(null);

    useEffect(() => {
        async function fetchStats() {
            const stats = await getUserStats();
            setStreak(stats?.current_streak || 0);
        }
        fetchStats();
    }, []);

    if (streak === null) {
        return (
            <div className="bg-white p-6 rounded-3xl border border-ace-blue/10 shadow-sm h-full flex flex-col justify-center">
                <Skeleton className="h-4 w-24 mb-2 bg-green-50" />
                <Skeleton className="h-8 w-16 bg-green-100" />
            </div>
        );
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="bg-white p-6 rounded-3xl border border-ace-blue/10 shadow-sm hover:shadow-lg transition-shadow relative overflow-hidden group cursor-pointer">
                    {/* Background Effect */}
                    {streak > 3 && (
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Flame className="w-24 h-24 text-orange-500 transform rotate-12" />
                        </div>
                    )}

                    <div className="flex items-center gap-3 mb-2 relative z-10">
                        <div className={`p-2 rounded-full ${streak > 0 ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-400"}`}>
                            <Flame strokeWidth={1.5} className={`h-5 w-5 ${streak > 0 ? "animate-pulse" : ""}`} />
                        </div>
                        <span className="font-sans text-sm text-ace-blue/60 uppercase tracking-wide">Current Streak</span>
                    </div>
                    <div className="relative z-10 flex items-baseline gap-1">
                        <p className="font-serif text-3xl text-ace-blue transition-all">
                            {streak}
                        </p>
                        <span className="text-ace-blue/40 font-serif">days</span>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-serif text-2xl text-ace-blue">
                        <Award className="h-6 w-6 text-amber-500" />
                        Your Achievements
                    </DialogTitle>
                    <DialogDescription>
                        Unlock badges by maintaining streaks and mastering your focus.
                    </DialogDescription>
                </DialogHeader>

                <AchievementsList />
            </DialogContent>
        </Dialog>
    );
}

function AchievementsList() {
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        getUserStats().then(setUserData);
    }, []);

    if (!userData) return <div className="h-40 animate-pulse bg-gray-50 rounded-xl" />;

    const { badges: earnedCodes } = userData;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
            {BADGES.map((badge) => {
                const isEarned = earnedCodes.includes(badge.code);
                return (
                    <div
                        key={badge.code}
                        className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2 transition-all ${isEarned
                            ? "bg-amber-50 border-amber-200"
                            : "bg-gray-50 border-gray-100 opacity-50 grayscale"
                            }`}
                    >
                        <div className="text-4xl filter drop-shadow-sm">{badge.icon}</div>
                        <div>
                            <p className={`font-serif font-bold ${isEarned ? "text-amber-900" : "text-gray-400"}`}>
                                {badge.name}
                            </p>
                            <p className="text-xs text-ace-blue/60 mt-1">{badge.description}</p>
                        </div>
                        {isEarned && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] uppercase font-bold rounded-full">
                                Unlocked
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// Re-export BADGES here or import from server action if possible (usually separate file is better but keeping simple)
const BADGES = [
    { code: "FIRST_SESSION", name: "First Step", description: "Logged your first study session", icon: "🌱" },
    { code: "STREAK_3", name: "Momentum", description: "3-day study streak", icon: "🔥" },
    { code: "STREAK_7", name: "Unstoppable", description: "7-day study streak", icon: "🚀" },
    { code: "FOCUS_MASTER", name: "Focus Master", description: "Studied for 1000+ minutes total", icon: "🧠" },
    { code: "NIGHT_OWL", name: "Night Owl", description: "Logged a session after 10 PM", icon: "🦉" },
    { code: "EARLY_BIRD", name: "Early Bird", description: "Logged a session before 7 AM", icon: "🌅" },
];
