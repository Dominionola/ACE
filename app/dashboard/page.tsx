import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { GamificationDashboard } from "@/components/gamification/gamification-dashboard";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, Calendar, Flame } from "lucide-react";
import { TodaysPlan } from "@/components/todays-plan";
import { WeeklyReportCard } from "@/components/weekly-report-card";
import { DashboardTimer } from "@/components/dashboard-timer";
import { DueCardsWidget } from "@/components/due-cards-widget";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUpcomingExams } from "@/lib/actions/study";
import { getUserStats } from "@/lib/actions/gamification";
import { ActiveSessionCard } from "@/components/active-session-card";

// Force dynamic rendering - this page requires user auth
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get user's name
  const userName = user?.user_metadata?.full_name || "Student";

  // Get next exam
  let nextExam = null;
  let nextExamDate = "None";
  try {
    const exams = await getUpcomingExams();
    nextExam = exams.length > 0 ? exams[0] : null;
    nextExamDate = nextExam
      ? new Date(nextExam.exam_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "None";
  } catch {
    nextExamDate = "None";
  }

  // Get streak & stats
  let streak = 0;
  let stats: any = null;
  try {
    stats = await getUserStats();
    streak = stats?.current_streak || 0;
  } catch {
    streak = 0;
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-serif text-lg">Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 p-4 sm:p-6">
        {/* Welcome Section - Standalone */}
        <div className="mb-4">
          <h1 className="font-serif text-2xl sm:text-3xl text-ace-blue mb-1">
            Welcome back, <span className="italic">{userName}</span>
          </h1>
          <p className="font-sans text-ace-blue/60 text-sm">
            Continue your study sessions or create a new deck.
          </p>
        </div>

        {/* Active Session Card - Resumable */}
        <ActiveSessionCard />

        {/* Timer Row - Full Width */}
        <div className="mb-6">
          <DashboardTimer />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Due Cards + Stats + Today's Plan */}
          <div className="lg:col-span-2 space-y-6">
            {/* Due Cards Widget */}
            <DueCardsWidget />

            {/* Quick Stats Row */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Streak Counter */}
              <div className="bg-white p-5 rounded-2xl border border-ace-blue/10 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-full ${streak > 0 ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-400"}`}>
                    <Flame strokeWidth={1.5} className={`h-4 w-4 ${streak > 0 ? "animate-pulse" : ""}`} />
                  </div>
                  <span className="font-sans text-xs text-ace-blue/60 uppercase tracking-wide">Streak</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <p className="font-serif text-2xl text-ace-blue">{streak}</p>
                  <span className="text-ace-blue/40 font-serif">days</span>
                </div>
              </div>

              {/* Next Exam */}
              <div className="bg-white p-5 rounded-2xl border border-ace-blue/10 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-full ${nextExam ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-400"}`}>
                    <Calendar strokeWidth={1.5} className="h-4 w-4" />
                  </div>
                  <span className="font-sans text-xs text-ace-blue/60 uppercase tracking-wide">Next Exam</span>
                </div>
                <p className="font-serif text-2xl text-ace-blue">{nextExamDate}</p>
                {nextExam && (
                  <p className="text-xs text-ace-blue/50 mt-1 truncate">{nextExam.subject_name}</p>
                )}
              </div>
            </div>

            <TodaysPlan />
          </div>


          {/* Right: Weekly Report + Gamification + Create Deck */}
          <div className="lg:col-span-1 space-y-4">
            <GamificationDashboard stats={stats} earnedBadges={stats?.badges || []} />
            <WeeklyReportCard />
            {/* Quick Action */}
            <Link
              href="/dashboard/decks"
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-ace-blue text-white rounded-2xl font-medium hover:bg-ace-light transition-all shadow-lg hover:shadow-xl text-sm"
            >
              <Plus strokeWidth={1.5} className="h-4 w-4" />
              Create Deck
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
