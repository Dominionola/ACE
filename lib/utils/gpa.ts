/**
 * GPA Utility Functions
 * Supports both Nigerian grading system (4.0/5.0 scale) and percentage conversion
 */

interface GradePoint {
    grade: string;
    minScore: number;
    maxScore: number;
    point4: number; // 4.0 scale
    point5: number; // 5.0 scale (Nigerian system)
}

const GRADE_SCALE: GradePoint[] = [
    { grade: "A", minScore: 70, maxScore: 100, point4: 4.0, point5: 5.0 },
    { grade: "B", minScore: 60, maxScore: 69, point4: 3.0, point5: 4.0 },
    { grade: "C", minScore: 50, maxScore: 59, point4: 2.0, point5: 3.0 },
    { grade: "D", minScore: 45, maxScore: 49, point4: 1.0, point5: 2.0 },
    { grade: "E", minScore: 40, maxScore: 44, point4: 0.5, point5: 1.0 },
    { grade: "F", minScore: 0, maxScore: 39, point4: 0.0, point5: 0.0 },
];

export type GradeScale = "4.0" | "5.0";

/**
 * Convert a numeric grade to GPA point
 */
export function scoreToGPA(score: number, scale: GradeScale = "4.0"): number {
    for (const gp of GRADE_SCALE) {
        if (score >= gp.minScore && score <= gp.maxScore) {
            return scale === "5.0" ? gp.point5 : gp.point4;
        }
    }
    return 0;
}

/**
 * Convert a letter grade to GPA point
 */
export function letterToGPA(letter: string, scale: GradeScale = "4.0"): number | null {
    const grade = GRADE_SCALE.find(g => g.grade.toLowerCase() === letter.toLowerCase());
    if (!grade) return null;
    return scale === "5.0" ? grade.point5 : grade.point4;
}

/**
 * Calculate GPA from array of grade values (numeric or letter)
 */
export function calculateGPA(grades: string[], scale: GradeScale = "4.0"): number {
    if (grades.length === 0) return 0;

    let totalPoints = 0;
    let validCount = 0;

    for (const grade of grades) {
        const numeric = parseFloat(grade);
        let point: number | null = null;

        if (!isNaN(numeric)) {
            point = scoreToGPA(numeric, scale);
        } else {
            point = letterToGPA(grade, scale);
        }

        if (point !== null) {
            totalPoints += point;
            validCount++;
        }
    }

    if (validCount === 0) return 0;
    return Math.round((totalPoints / validCount) * 100) / 100;
}

/**
 * Get GPA classification based on scale
 */
export function getGPAClassification(gpa: number, scale: GradeScale = "4.0"): string {
    if (scale === "5.0") {
        if (gpa >= 4.5) return "First Class";
        if (gpa >= 3.5) return "Second Class Upper";
        if (gpa >= 2.5) return "Second Class Lower";
        if (gpa >= 1.5) return "Third Class";
        if (gpa >= 1.0) return "Pass";
        return "Fail";
    } else {
        if (gpa >= 3.5) return "First Class";
        if (gpa >= 3.0) return "Second Class Upper";
        if (gpa >= 2.0) return "Second Class Lower";
        if (gpa >= 1.0) return "Third Class";
        return "Fail";
    }
}

/**
 * Calculate semester-wise GPA trends
 */
export function calculateGPATrends(
    grades: { semester: string; grade_value: string }[],
    scale: GradeScale = "4.0"
): { semester: string; gpa: number }[] {
    // Group by semester
    const semesterMap = new Map<string, string[]>();

    for (const g of grades) {
        const semester = g.semester || "Unknown";
        if (!semesterMap.has(semester)) {
            semesterMap.set(semester, []);
        }
        semesterMap.get(semester)!.push(g.grade_value);
    }

    // Calculate GPA per semester
    const trends: { semester: string; gpa: number }[] = [];
    for (const [semester, gradeValues] of semesterMap) {
        trends.push({
            semester,
            gpa: calculateGPA(gradeValues, scale),
        });
    }

    return trends.sort((a, b) => a.semester.localeCompare(b.semester));
}

/**
 * Calculate cumulative GPA across all grades
 */
export function calculateCGPA(
    grades: { grade_value: string }[],
    scale: GradeScale = "4.0"
): number {
    return calculateGPA(grades.map(g => g.grade_value), scale);
}
