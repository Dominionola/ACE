"use server";

import { createClient } from "@/lib/supabase/server";

interface GradeTrend {
    semester: string;
    subjects: Record<string, number>;
    average: number;
}

interface SubjectTrend {
    semester: string;
    grade: number;
}

export async function getPerformanceTrends() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { trends: [], subjects: [] };

    const { data: grades, error } = await supabase
        .from("grade_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

    if (error || !grades || grades.length === 0) {
        return { trends: [], subjects: [] };
    }

    // Group grades by semester
    const semesterMap = new Map<string, { subjects: Record<string, number>, total: number, count: number }>();
    const allSubjects = new Set<string>();

    for (const grade of grades) {
        const semester = grade.semester || "Unknown";
        const subject = grade.subject_name;
        const gradeValue = parseFloat(grade.grade_value);

        if (isNaN(gradeValue)) continue; // Skip non-numeric grades for now

        allSubjects.add(subject);

        if (!semesterMap.has(semester)) {
            semesterMap.set(semester, { subjects: {}, total: 0, count: 0 });
        }

        const semData = semesterMap.get(semester)!;
        semData.subjects[subject] = gradeValue;
        semData.total += gradeValue;
        semData.count += 1;
    }

    // Convert to array format for Recharts
    const trends: GradeTrend[] = [];
    for (const [semester, data] of semesterMap) {
        trends.push({
            semester,
            subjects: data.subjects,
            average: data.count > 0 ? Math.round((data.total / data.count) * 10) / 10 : 0,
        });
    }

    // Sort by semester (assuming format like "Fall 2024", "Spring 2025", etc.)
    trends.sort((a, b) => a.semester.localeCompare(b.semester));

    return {
        trends,
        subjects: Array.from(allSubjects).sort(),
    };
}

export async function getSubjectTrend(subjectName: string): Promise<SubjectTrend[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: grades } = await supabase
        .from("grade_history")
        .select("semester, grade_value")
        .eq("user_id", user.id)
        .eq("subject_name", subjectName)
        .order("created_at", { ascending: true });

    if (!grades) return [];

    return grades
        .filter(g => !isNaN(parseFloat(g.grade_value)))
        .map(g => ({
            semester: g.semester || "Unknown",
            grade: parseFloat(g.grade_value),
        }));
}
