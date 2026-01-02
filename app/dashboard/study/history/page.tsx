import { getStudySessionsForWeek } from "@/lib/actions/study";
import { createClient } from "@/lib/supabase/server";
import { Clock, BookOpen, Calendar } from "lucide-react";

export default async function StudyHistoryPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get this week's summary
    const weekData = await getStudySessionsForWeek();

    // Get all-time sessions (last 30 days for performance)
    let allSessions: {
        id: string;
        subject_name: string;
        duration_minutes: number;
        study_date: string;
        notes?: string;
        created_at: string;
    }[] = [];

    if (user) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data } = await supabase
            .from("study_sessions")
            .select("*")
            .eq("user_id", user.id)
            .gte("study_date", thirtyDaysAgo.toISOString().split("T")[0])
            .order("created_at", { ascending: false });

        allSessions = data || [];
    }

    const totalMinutes = allSessions.reduce((sum, s) => sum + s.duration_minutes, 0);
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

    // Group by date
    const sessionsByDate: Record<string, typeof allSessions> = {};
    for (const session of allSessions) {
        const date = session.study_date;
        if (!sessionsByDate[date]) sessionsByDate[date] = [];
        sessionsByDate[date].push(session);
    }

    const sortedDates = Object.keys(sessionsByDate).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    );

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-4xl">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-xl">
                        <Clock className="h-6 w-6 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-ace-blue tracking-tight">
                        Study History
                    </h1>
                </div>
                <p className="text-ace-blue/60 mt-2 text-lg">
                    Track your study sessions and see your progress over time.
                </p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-ace-blue/10 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <Clock className="h-5 w-5 text-ace-blue" />
                        </div>
                        <span className="font-sans text-sm text-ace-blue/60 uppercase tracking-wide">
                            This Week
                        </span>
                    </div>
                    <p className="font-serif text-3xl text-ace-blue">
                        {Math.round(weekData.totalMinutes / 60 * 10) / 10}h
                    </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-ace-blue/10 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-full">
                            <Calendar className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="font-sans text-sm text-ace-blue/60 uppercase tracking-wide">
                            Last 30 Days
                        </span>
                    </div>
                    <p className="font-serif text-3xl text-ace-blue">{totalHours}h</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-ace-blue/10 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-full">
                            <BookOpen className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="font-sans text-sm text-ace-blue/60 uppercase tracking-wide">
                            Sessions
                        </span>
                    </div>
                    <p className="font-serif text-3xl text-ace-blue">{allSessions.length}</p>
                </div>
            </div>

            {/* Sessions List */}
            <div className="bg-white rounded-3xl border border-ace-blue/10 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-ace-blue/10">
                    <h2 className="font-serif text-xl text-ace-blue">Recent Sessions</h2>
                </div>

                {sortedDates.length > 0 ? (
                    <div className="divide-y divide-ace-blue/5">
                        {sortedDates.map((date) => (
                            <div key={date} className="p-4">
                                <p className="text-sm font-medium text-ace-blue/60 mb-3">
                                    {new Date(date).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </p>
                                <div className="space-y-2">
                                    {sessionsByDate[date].map((session) => (
                                        <div
                                            key={session.id}
                                            className="flex items-center justify-between p-3 bg-cream-50 rounded-xl"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-2 w-2 rounded-full bg-ace-accent" />
                                                <span className="font-medium text-ace-blue">
                                                    {session.subject_name}
                                                </span>
                                            </div>
                                            <span className="text-sm text-ace-blue/60">
                                                {session.duration_minutes} min
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-ace-blue/40">
                        <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p className="font-serif italic">No study sessions yet.</p>
                        <p className="text-sm mt-1">
                            Log your first session from the dashboard!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
