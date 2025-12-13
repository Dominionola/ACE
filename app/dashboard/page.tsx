import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, BookOpen, Calendar, TrendingUp } from "lucide-react";

export default function DashboardPage() {
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

      <main className="flex-1 p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-ace-blue mb-2">
            Welcome back, <span className="italic">Student</span>
          </h1>
          <p className="font-sans text-ace-blue/60">
            Continue your study sessions or create a new deck.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-ace-blue/10 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-full text-ace-blue">
                <BookOpen strokeWidth={1.5} className="h-5 w-5" />
              </div>
              <span className="font-sans text-sm text-ace-blue/60 uppercase tracking-wide">Cards Due</span>
            </div>
            <p className="font-serif text-3xl text-ace-blue">24</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-ace-blue/10 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-full text-green-700">
                <TrendingUp strokeWidth={1.5} className="h-5 w-5" />
              </div>
              <span className="font-sans text-sm text-ace-blue/60 uppercase tracking-wide">Streak</span>
            </div>
            <p className="font-serif text-3xl text-ace-blue">7 days</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-ace-blue/10 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-full text-orange-700">
                <Calendar strokeWidth={1.5} className="h-5 w-5" />
              </div>
              <span className="font-sans text-sm text-ace-blue/60 uppercase tracking-wide">Next Exam</span>
            </div>
            <p className="font-serif text-3xl text-ace-blue">Dec 20</p>
          </div>
        </div>

        {/* Quick Action */}
        <div className="bg-ace-blue/5 p-8 rounded-3xl border border-ace-blue/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl text-ace-blue mb-1">Ready to study?</h2>
            <p className="font-sans text-ace-blue/60">Create a new deck or start a review session.</p>
          </div>
          <button className="px-8 py-4 bg-ace-blue text-white rounded-full font-medium hover:bg-ace-light transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
            <Plus strokeWidth={1.5} className="h-5 w-5" />
            Create Deck
          </button>
        </div>
      </main>
    </>
  );
}

