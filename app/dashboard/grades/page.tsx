import { GradeForm } from "@/components/grade-form";
import { GradeList } from "@/components/grade-list";
import { GoalForm } from "@/components/goal-form";
import { ReportCardUploader } from "@/components/report-uploader";
import { getGrades, getSubjectGoals, getUniqueSubjects, getUniqueSemesters } from "@/lib/actions/grade";

export default async function GradesPage() {
    const grades = await getGrades();
    const goals = await getSubjectGoals();
    const subjects = await getUniqueSubjects();
    const semesters = await getUniqueSemesters();

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-5xl">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Performance Tracker</h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Log your grades and set goals to unlock personalized AI strategy.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left Column: Input Forms */}
                <div className="lg:col-span-1 space-y-6">
                    <section>
                        <ReportCardUploader />
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span>📝 Log Result</span>
                        </h2>
                        <GradeForm subjects={subjects} />
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span>🎯 Set Goal</span>
                        </h2>
                        <GoalForm subjects={subjects} />
                    </section>
                </div>

                {/* Right Column: History List */}
                <div className="lg:col-span-2">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span>📊 Grade History</span>
                    </h2>
                    <GradeList grades={grades} goals={goals} semesters={semesters} />
                </div>
            </div>
        </div>
    );
}
