import { getGradesForSemester, getStudyStrategy, getWeeklyFocus } from "@/lib/actions/strategy";
import { getUpcomingExams, getStudySessionsForWeek } from "@/lib/actions/study";
import { StrategyView } from "@/components/strategy-view";
import { WeeklyFocusEditor } from "@/components/weekly-focus-editor";
import { StudySchedule } from "@/components/study-schedule";
import { SessionLogger } from "@/components/session-logger";
import { ExamTracker } from "@/components/exam-tracker";
import { StudyProgress } from "@/components/study-progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

interface SemesterPageProps {
    params: Promise<{ semester: string }>;
}

export default async function SemesterPage({ params }: SemesterPageProps) {
    const { semester } = await params;
    const decodedSemester = decodeURIComponent(semester);

    const { grades, goals } = await getGradesForSemester(decodedSemester);
    const existingStrategy = await getStudyStrategy(decodedSemester);
    const weeklyFocus = await getWeeklyFocus(decodedSemester);
    const exams = await getUpcomingExams();
    const { totalMinutes, bySubject } = await getStudySessionsForWeek();

    // Calculate planned minutes from weekly focus
    const plannedMinutes = weeklyFocus.reduce((sum: number, item: any) => sum + (item.hours * 60), 0);

    // Extract all subject names for the course picker
    const availableSubjects = grades.map((g: any) => g.subject_name);

    // Helper to find goal for a subject
    const getGoal = (subject: string) => goals.find((g: any) => g.subject_name.toLowerCase() === subject.toLowerCase());

    // Calculate stats
    const totalSubjects = grades.length;
    const goalsSet = grades.filter((g: any) => getGoal(g.subject_name)).length;
    const goalsMet = grades.filter((g: any) => {
        const goal = getGoal(g.subject_name);
        if (!goal) return false;
        const gradeNum = parseFloat(g.grade_value);
        const goalNum = parseFloat(goal.target_grade);
        return !isNaN(gradeNum) && !isNaN(goalNum) && gradeNum >= goalNum;
    }).length;

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            {/* Header */}
            <div className="mb-8">
                <Link href="/dashboard/grades" className="inline-flex items-center gap-2 text-ace-blue/60 hover:text-ace-blue transition-colors mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-sm font-medium">Back to Performance</span>
                </Link>

                <h1 className="text-4xl font-serif font-bold text-ace-blue">{decodedSemester}</h1>
                <p className="text-ace-blue/60 mt-2">Review your performance and get AI-powered study strategies.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* 1. Progress Card */}
                <StudyProgress
                    plannedMinutes={plannedMinutes}
                    completedMinutes={totalMinutes}
                    bySubject={bySubject}
                />

                {/* 2. Quick Log Card */}
                <div className="bg-white p-5 rounded-2xl border border-ace-blue/5 shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-sm text-ace-blue/60 uppercase tracking-wide font-bold mb-1">Study Logger</p>
                        <p className="text-sm text-ace-blue/80">Track your daily progress.</p>
                    </div>
                    <div className="mt-4">
                        <SessionLogger subjects={availableSubjects} />
                    </div>
                </div>

                {/* 3. Goals Stats */}
                <div className="bg-white p-5 rounded-2xl border border-ace-blue/5 shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-sm text-ace-blue/60 uppercase tracking-wide font-bold mb-1">Goals Met</p>
                        <p className="text-3xl font-serif font-bold text-ace-blue">{goalsMet}<span className="text-base font-sans font-normal text-ace-blue/40">/{goalsSet || 0}</span></p>
                    </div>
                </div>
            </div>

            {/* Exam Tracker */}
            <div className="mb-8">
                <ExamTracker subjects={availableSubjects} exams={exams} />
            </div>

            {/* Subjects Grid */}
            <div className="mb-8">
                <h2 className="text-xl font-serif font-semibold text-ace-blue mb-4">Subject Breakdown</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {grades.map((grade: any) => {
                        const goal = getGoal(grade.subject_name);
                        let status: "met" | "missed" | "neutral" = "neutral";

                        if (goal) {
                            const gradeNum = parseFloat(grade.grade_value);
                            const goalNum = parseFloat(goal.target_grade);
                            if (!isNaN(gradeNum) && !isNaN(goalNum)) {
                                status = gradeNum >= goalNum ? "met" : "missed";
                            } else {
                                // For letter grades, check exact match
                                status = grade.grade_value.toLowerCase() === goal.target_grade.toLowerCase() ? "met" : "missed";
                            }
                        }

                        return (
                            <div key={grade.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-ace-blue/5 shadow-sm">
                                <div>
                                    <h4 className="font-semibold text-ace-blue">{grade.subject_name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xl font-bold font-serif text-ace-blue">{grade.grade_value}</span>
                                        {goal && (
                                            <span className="flex items-center gap-1 text-sm text-ace-blue/50">
                                                <Target className="h-3 w-3" /> {goal.target_grade}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {status === "met" && <CheckCircle className="h-6 w-6 text-green-500" />}
                                {status === "missed" && <AlertCircle className="h-6 w-6 text-amber-500" />}
                                {status === "neutral" && <Badge variant="outline" className="text-xs">No Goal</Badge>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Weekly Focus Editor */}
            <div className="mb-8">
                <WeeklyFocusEditor
                    semester={decodedSemester}
                    initialFocus={weeklyFocus}
                    availableSubjects={availableSubjects}
                />
            </div>

            {/* Generated Study Schedule */}
            {
                weeklyFocus.length > 0 && (
                    <div className="mb-8 bg-white p-6 rounded-3xl border border-ace-blue/10 shadow-sm">
                        <StudySchedule focusItems={weeklyFocus} />
                    </div>
                )
            }

            {/* AI Strategy Section */}
            <StrategyView
                semester={decodedSemester}
                existingStrategy={existingStrategy?.strategy_content || null}
            />
        </div >
    );
}
