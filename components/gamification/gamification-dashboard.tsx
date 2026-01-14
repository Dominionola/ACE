"use client";

import { UserStats } from "@/lib/gamification";
import { Card } from "@/components/ui/card";
import { BadgeList } from "./badge-list";
import { XPBar } from "./xp-bar";
import { StreakFlame } from "./streak-flame";
import { Trophy } from "lucide-react";

interface GamificationDashboardProps {
    stats: UserStats | null;
    earnedBadges: string[];
}

export function GamificationDashboard({ stats, earnedBadges }: GamificationDashboardProps) {
    if (!stats) return null;

    return (
        <Card className="p-6 bg-white border-ace-blue/10 rounded-3xl space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-lg font-serif font-bold text-ace-blue flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        Achievements
                    </h2>
                    <p className="text-sm text-ace-blue/60">Level up your learning journey.</p>
                </div>
                <StreakFlame days={stats.current_streak} />
            </div>

            <XPBar xp={stats.xp} level={stats.level} />

            <div className="pt-2">
                <h3 className="text-xs font-bold text-ace-blue mb-3 uppercase tracking-wider opacity-70">Badges</h3>
                <BadgeList earnedBadges={earnedBadges} />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-ace-blue/5 rounded-xl p-3 text-center">
                    <span className="block text-2xl font-bold text-ace-blue">{stats.total_minutes_studied}</span>
                    <span className="text-xs text-ace-blue/60 font-medium">Minutes Studied</span>
                </div>
                <div className="bg-ace-blue/5 rounded-xl p-3 text-center">
                    <span className="block text-2xl font-bold text-ace-blue">{stats.longest_streak}</span>
                    <span className="text-xs text-ace-blue/60 font-medium">Longest Streak</span>
                </div>
            </div>
        </Card>
    );
}
