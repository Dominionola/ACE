
export interface UserStats {
    user_id: string;
    current_streak: number;
    longest_streak: number;
    total_minutes_studied: number;
    xp: number;
    level: number;
    last_study_date: string | null;
}

export const BADGES = [
    { code: "FIRST_SESSION", name: "First Step", description: "Logged your first study session", icon: "🌱" },
    { code: "STREAK_3", name: "Momentum", description: "3-day study streak", icon: "🔥" },
    { code: "STREAK_7", name: "Unstoppable", description: "7-day study streak", icon: "🚀" },
    { code: "FOCUS_MASTER", name: "Focus Master", description: "Studied for 1000+ minutes total", icon: "🧠" },
    { code: "NIGHT_OWL", name: "Night Owl", description: "Logged a session after 10 PM", icon: "🦉" },
    { code: "EARLY_BIRD", name: "Early Bird", description: "Logged a session before 7 AM", icon: "🌅" },
];
