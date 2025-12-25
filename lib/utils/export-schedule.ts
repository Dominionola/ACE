/**
 * Export schedule to iCal format (.ics)
 */

import { type WeeklySchedule, getWeekDateRange } from "@/lib/utils/schedule";

/**
 * Generate iCal content from a weekly schedule
 */
export function generateICalContent(schedule: WeeklySchedule): string {
    const { start } = getWeekDateRange(schedule.weekNumber);

    const events: string[] = [];

    // Map day index to date offset
    const dayOffsets = [0, 1, 2, 3, 4, 5, 6]; // Mon = 0, Sun = 6

    for (let dayIndex = 0; dayIndex < schedule.days.length; dayIndex++) {
        const day = schedule.days[dayIndex];

        let currentHour = 9; // Start at 9 AM

        for (const block of day.blocks) {
            const eventDate = new Date(start);
            eventDate.setDate(eventDate.getDate() + dayOffsets[dayIndex]);

            const startHour = currentHour;
            const endMinutes = currentHour * 60 + block.duration;
            const endHour = Math.floor(endMinutes / 60);
            const endMin = endMinutes % 60;

            const dtStart = formatICalDate(eventDate, startHour, 0);
            const dtEnd = formatICalDate(eventDate, endHour, endMin);

            events.push(`BEGIN:VEVENT
UID:${crypto.randomUUID()}
DTSTAMP:${formatICalDate(new Date())}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:📚 Study: ${block.subject}
DESCRIPTION:${block.isEmphasis ? "Priority focus this week!" : "Regular study session"}
END:VEVENT`);

            currentHour = endHour + (endMin > 0 ? 1 : 0);
        }
    }

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ACE Study Companion//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Study Schedule Week ${schedule.weekNumber}
${events.join("\n")}
END:VCALENDAR`;
}

function formatICalDate(date: Date, hour = 0, minute = 0): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const h = String(hour).padStart(2, "0");
    const m = String(minute).padStart(2, "0");
    return `${year}${month}${day}T${h}${m}00`;
}

/**
 * Trigger download of iCal file
 */
export function downloadICalFile(schedule: WeeklySchedule): void {
    const content = generateICalContent(schedule);
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `study-schedule-week-${schedule.weekNumber}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
