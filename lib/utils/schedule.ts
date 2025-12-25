/**
 * Study Schedule Generator
 * Converts weekly focus hours into a daily study schedule
 * Supports weekly rotation and calendar tracking
 */

export interface FocusItem {
    subject: string;
    hours: number;
}

export interface ScheduleBlock {
    subject: string;
    duration: number; // in minutes
    startTime?: string; // e.g., "09:00"
    isEmphasis?: boolean; // true if this subject is emphasized this week
}

export interface DailySchedule {
    day: string;
    dayShort: string;
    blocks: ScheduleBlock[];
    totalMinutes: number;
}

export interface WeeklySchedule {
    days: DailySchedule[];
    totalHours: number;
    weekNumber: number;
    emphasisSubject: string | null;
    dateRange: { start: string; end: string };
}

const WEEKDAYS = [
    { day: "Monday", short: "Mon" },
    { day: "Tuesday", short: "Tue" },
    { day: "Wednesday", short: "Wed" },
    { day: "Thursday", short: "Thu" },
    { day: "Friday", short: "Fri" },
    { day: "Saturday", short: "Sat" },
    { day: "Sunday", short: "Sun" },
];

// ============================================
// Week Calendar Utilities
// ============================================

/**
 * Get the ISO week number of a date
 */
export function getWeekNumber(date: Date = new Date()): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Get the start and end dates of a week
 */
export function getWeekDateRange(weekNumber: number, year: number = new Date().getFullYear()): { start: Date; end: Date } {
    const jan1 = new Date(year, 0, 1);
    const days = (weekNumber - 1) * 7;
    const dayOfWeek = jan1.getDay() || 7; // Mon = 1, Sun = 7
    const startOffset = 1 - dayOfWeek + days;

    const start = new Date(year, 0, 1 + startOffset);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    return { start, end };
}

/**
 * Format date to short string (e.g., "Dec 22")
 */
export function formatShortDate(date: Date): string {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Calculate which week of the semester we're in (1-16 typically)
 */
export function getSemesterWeek(semesterStart: Date, currentDate: Date = new Date()): number {
    const diffTime = currentDate.getTime() - semesterStart.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.floor(diffDays / 7) + 1);
}

// ============================================
// Schedule Generation with Rotation
// ============================================

/**
 * Generate a weekly study schedule with rotation emphasis
 * Each week, a different subject gets extra focus (rotation)
 */
export function generateWeeklySchedule(
    focusItems: FocusItem[],
    studyDays: number[] = [0, 1, 2, 3, 4], // Mon-Fri by default
    maxHoursPerDay: number = 6,
    weekNumber: number = getWeekNumber() // Current week by default
): WeeklySchedule {
    const { start, end } = getWeekDateRange(weekNumber);
    const dateRange = {
        start: formatShortDate(start),
        end: formatShortDate(end),
    };

    if (focusItems.length === 0) {
        return {
            days: WEEKDAYS.map(d => ({ day: d.day, dayShort: d.short, blocks: [], totalMinutes: 0 })),
            totalHours: 0,
            weekNumber,
            emphasisSubject: null,
            dateRange,
        };
    }

    // Determine which subject to emphasize this week (rotation)
    const emphasisIndex = (weekNumber - 1) % focusItems.length;
    const emphasisSubject = focusItems[emphasisIndex].subject;

    // Reorder items to prioritize emphasis subject
    const rotatedItems = [...focusItems].sort((a, b) => {
        if (a.subject === emphasisSubject) return -1;
        if (b.subject === emphasisSubject) return 1;
        return b.hours - a.hours;
    });

    // Apply emphasis: give the emphasized subject 20% more time
    const adjustedItems = rotatedItems.map(item => ({
        ...item,
        hours: item.subject === emphasisSubject
            ? Math.round(item.hours * 1.2 * 10) / 10
            : item.hours,
        isEmphasis: item.subject === emphasisSubject,
    }));

    // Initialize daily schedules
    const dailySchedules: (DailySchedule & { isStudyDay: boolean })[] = WEEKDAYS.map((d, idx) => ({
        day: d.day,
        dayShort: d.short,
        blocks: [],
        totalMinutes: 0,
        isStudyDay: studyDays.includes(idx),
    }));

    // Calculate total hours
    const totalHours = adjustedItems.reduce((sum, item) => sum + item.hours, 0);

    // Distribute each subject's hours across study days
    for (const item of adjustedItems) {
        const totalMinutes = item.hours * 60;
        let remainingMinutes = totalMinutes;

        const idealBlockSize = 60;
        const numBlocks = Math.ceil(totalMinutes / idealBlockSize);
        const minutesPerBlock = Math.ceil(totalMinutes / numBlocks);

        for (let i = 0; i < numBlocks && remainingMinutes > 0; i++) {
            const availableDays = dailySchedules
                .filter(d => d.isStudyDay)
                .filter(d => d.totalMinutes < maxHoursPerDay * 60);

            if (availableDays.length === 0) break;

            availableDays.sort((a, b) => a.totalMinutes - b.totalMinutes);

            const targetDay = availableDays[0];
            const blockDuration = Math.min(minutesPerBlock, remainingMinutes);

            targetDay.blocks.push({
                subject: item.subject,
                duration: blockDuration,
                isEmphasis: (item as any).isEmphasis,
            });
            targetDay.totalMinutes += blockDuration;
            remainingMinutes -= blockDuration;
        }
    }

    // Sort blocks within each day
    for (const day of dailySchedules) {
        day.blocks.sort((a, b) => {
            // Emphasis blocks first, then by duration
            if (a.isEmphasis && !b.isEmphasis) return -1;
            if (!a.isEmphasis && b.isEmphasis) return 1;
            return b.duration - a.duration;
        });
    }

    return {
        days: dailySchedules,
        totalHours,
        weekNumber,
        emphasisSubject,
        dateRange,
    };
}

/**
 * Get schedules for multiple weeks (for preview)
 */
export function getWeeklySchedules(
    focusItems: FocusItem[],
    numWeeks: number = 4,
    startWeek: number = getWeekNumber()
): WeeklySchedule[] {
    return Array.from({ length: numWeeks }, (_, i) =>
        generateWeeklySchedule(focusItems, undefined, undefined, startWeek + i)
    );
}

// ============================================
// Formatting Utilities
// ============================================

/**
 * Format duration in minutes to human-readable string
 */
export function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Get a color for a subject based on its name (consistent hashing)
 */
export function getSubjectColor(subject: string, isEmphasis?: boolean): string {
    const colors = [
        "bg-blue-100 text-blue-800 border-blue-200",
        "bg-green-100 text-green-800 border-green-200",
        "bg-purple-100 text-purple-800 border-purple-200",
        "bg-amber-100 text-amber-800 border-amber-200",
        "bg-rose-100 text-rose-800 border-rose-200",
        "bg-cyan-100 text-cyan-800 border-cyan-200",
        "bg-indigo-100 text-indigo-800 border-indigo-200",
        "bg-orange-100 text-orange-800 border-orange-200",
    ];

    // Emphasis gets a special highlight
    if (isEmphasis) {
        return "bg-ace-blue text-white border-ace-blue ring-2 ring-ace-accent";
    }

    let hash = 0;
    for (let i = 0; i < subject.length; i++) {
        hash = subject.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
}

