import { getWeeklyFocus } from "@/lib/actions/strategy";
import { getUniqueSubjects, getUniqueSemesters } from "@/lib/actions/grade";
import { getActivePlans } from "@/lib/actions/plans";
import { StudySchedule } from "@/components/study-schedule";
import { WeeklyFocusEditor } from "@/components/weekly-focus-editor";
import { Calendar } from "lucide-react";

export default async function SchedulePage() {
    // Get the most recent semester
    const semesters = await getUniqueSemesters();
    const currentSemester = semesters[0] || "Fall 2024";

    const focusItems = await getWeeklyFocus(currentSemester);
    const plans = await getActivePlans();
    const subjectsData = await getUniqueSubjects();
    const subjects = subjectsData.map(s => s.value);

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-6xl">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-ace-blue/10 rounded-xl">
                        <Calendar className="h-6 w-6 text-ace-blue" />
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-ace-blue tracking-tight">
                        Study Schedule
                    </h1>
                </div>
                <p className="text-ace-blue/60 mt-2 text-lg">
                    Plan your weekly study sessions and stay on track.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Focus Editor */}
                <div className="lg:col-span-1">
                    <WeeklyFocusEditor
                        initialFocus={focusItems}
                        availableSubjects={subjects}
                        semester={currentSemester}
                    />
                </div>

                {/* Right: Schedule View */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-3xl border border-ace-blue/10 shadow-sm">
                        <StudySchedule focusItems={focusItems} plans={plans} />
                    </div>
                </div>
            </div>
        </div>
    );
}
