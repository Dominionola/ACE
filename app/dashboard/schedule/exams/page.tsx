import { getUpcomingExams } from "@/lib/actions/study";
import { getUniqueSubjects } from "@/lib/actions/grade";
import { ExamTracker } from "@/components/exam-tracker";
import { CalendarDays } from "lucide-react";

export default async function ExamsPage() {
    const exams = await getUpcomingExams();
    const subjectsData = await getUniqueSubjects();
    // Convert from {value, label} to string array for ExamTracker
    const subjects = subjectsData.map(s => s.value);

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-4xl">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-100 rounded-xl">
                        <CalendarDays className="h-6 w-6 text-orange-600" />
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-ace-blue tracking-tight">
                        Upcoming Exams
                    </h1>
                </div>
                <p className="text-ace-blue/60 mt-2 text-lg">
                    Track your exams and automatically boost study time as deadlines approach.
                </p>
            </header>

            <div className="max-w-2xl">
                <ExamTracker subjects={subjects} exams={exams} />
            </div>

            {/* Exam Tips */}
            <div className="bg-ace-blue/5 p-6 rounded-3xl border border-ace-blue/10">
                <h2 className="font-serif text-xl text-ace-blue mb-3">💡 Study Tips</h2>
                <ul className="space-y-2 text-ace-blue/70 font-sans">
                    <li className="flex items-start gap-2">
                        <span className="text-ace-accent">•</span>
                        <span>Exams within 7 days get <strong>+30%</strong> study time boost</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-ace-accent">•</span>
                        <span>Add exams early to plan your revision schedule</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-ace-accent">•</span>
                        <span>Use quizzes to test your knowledge before the exam</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
