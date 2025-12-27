import { GradeForm } from "@/components/grade-form";
import { GradeList } from "@/components/grade-list";
import { GoalForm } from "@/components/goal-form";
import { ReportCardUploader } from "@/components/report-uploader";
import { PerformanceChart } from "@/components/performance-chart";
import { getGrades, getSubjectGoals, getUniqueSubjects, getUniqueSemesters } from "@/lib/actions/grade";
import { getPerformanceTrends } from "@/lib/actions/analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Target, BarChart2, TrendingUp } from "lucide-react";

export default async function GradesPage() {
    const grades = await getGrades();
    const goals = await getSubjectGoals();
    const subjects = await getUniqueSubjects();
    const semesters = await getUniqueSemesters();
    const { trends, subjects: trendSubjects } = await getPerformanceTrends();

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-6xl">
            <header className="mb-8">
                <h1 className="text-4xl font-serif font-bold text-ace-blue tracking-tight">Performance Tracker</h1>
                <p className="text-ace-blue/60 mt-2 text-lg">
                    Log your grades, set goals, and visualize your academic progress.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left Column: Input Forms */}
                <div className="lg:col-span-1 space-y-6">
                    <section>
                        <ReportCardUploader />
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-ace-blue">
                            <span className="flex items-center gap-2"><Pencil className="w-4 h-4" /> Log Result</span>
                        </h2>
                        <GradeForm subjects={subjects} />
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-ace-blue">
                            <span className="flex items-center gap-2"><Target className="w-4 h-4" /> Set Goal</span>
                        </h2>
                        <GoalForm subjects={subjects} />
                    </section>
                </div>

                {/* Right Column: History & Trends */}
                <div className="lg:col-span-2">
                    <Tabs defaultValue="history" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6 bg-cream-100 rounded-full p-1">
                            <TabsTrigger
                                value="history"
                                className="rounded-full data-[state=active]:bg-white data-[state=active]:text-ace-blue data-[state=active]:shadow-sm flex items-center gap-2"
                            >
                                <BarChart2 className="w-4 h-4" /> Grade History
                            </TabsTrigger>
                            <TabsTrigger
                                value="trends"
                                className="rounded-full data-[state=active]:bg-white data-[state=active]:text-ace-blue data-[state=active]:shadow-sm flex items-center gap-2"
                            >
                                <TrendingUp className="w-4 h-4" /> Performance Trends
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="history">
                            <GradeList grades={grades} goals={goals} semesters={semesters} />
                        </TabsContent>

                        <TabsContent value="trends">
                            <div className="bg-white p-6 rounded-3xl border border-ace-blue/10 shadow-sm">
                                <PerformanceChart trends={trends} subjects={trendSubjects} />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

