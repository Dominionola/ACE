"use server";

import { createClient } from "@/lib/supabase/server";
import { WeeklySchedule, getWeekDateRange } from "@/lib/utils/schedule";
import { revalidatePath } from "next/cache";

export async function syncScheduleToGoogle(schedule: WeeklySchedule) {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.provider_token) {
        return { success: false, error: "Authentication required. Please connect Google Calendar." };
    }

    const { start } = getWeekDateRange(schedule.weekNumber);
    const googleToken = session.provider_token;

    let totalEvents = 0;

    try {
        // Iterate through each day in the schedule
        for (let dayIndex = 0; dayIndex < schedule.days.length; dayIndex++) {
            const daySchedule = schedule.days[dayIndex];
            if (daySchedule.blocks.length === 0) continue;

            // Calculate the specific date for this day
            // getWeekDateRange returns start (Monday)
            // dayIndex 0 = Monday, so add dayIndex days
            const currentDate = new Date(start);
            currentDate.setDate(currentDate.getDate() + dayIndex);

            // Start scheduling at 6:00 PM (18:00) by default
            // In a full app, this would be a user preference
            let currentHour = 18;
            let currentMinute = 0;

            for (const block of daySchedule.blocks) {
                // Construct Start Time
                const startTime = new Date(currentDate);
                startTime.setHours(currentHour, currentMinute, 0);

                // Construct End Time
                const endTime = new Date(startTime.getTime() + block.duration * 60000);

                // Prepare Event Data
                const event = {
                    summary: `Study: ${block.subject} ${block.isEmphasis ? '(Focus)' : ''}`,
                    description: `Automated study session for ${block.subject}. Duration: ${block.duration}m.`,
                    start: {
                        dateTime: startTime.toISOString(),
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
                    },
                    end: {
                        dateTime: endTime.toISOString(),
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
                    },
                    colorId: block.isEmphasis ? "11" : "9", // 11=Red (Focus), 9=Blue (Default)
                };

                // Insert into Google Calendar
                // We use fetch directly to avoid adding 'googleapis' dependency weight for just this feature
                const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${googleToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(event),
                });

                if (!response.ok) {
                    const errorBody = await response.text();
                    console.error("Google Calendar API Error:", errorBody);
                    // If token is invalid/expired, we might catch it here
                    if (response.status === 401) {
                        return { success: false, error: "Session expired. Please reconnect Google Calendar." };
                    }
                    continue; // Skip failed event but try others
                }

                totalEvents++;

                // Update start time for next block (add duration + 10 min break)
                const nextStartTime = new Date(endTime.getTime() + 10 * 60000);
                currentHour = nextStartTime.getHours();
                currentMinute = nextStartTime.getMinutes();
            }
        }

        return { success: true, count: totalEvents };

    } catch (error) {
        console.error("Sync error:", error);
        return { success: false, error: "Failed to sync connection." };
    }
}
