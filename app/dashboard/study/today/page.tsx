import { getTodaysPlan } from "@/lib/actions/today";
import { DailyStudyView } from "@/components/daily-study-view";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default async function TodayStudyPage() {
    // Fetch data on the server
    const plan = await getTodaysPlan();

    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="font-serif">Today's Focus</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </header>

            <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
                <div className="mb-8">
                    <h1 className="font-serif text-4xl text-ace-blue mb-2">
                        Today's Study Plan
                    </h1>
                    <p className="font-sans text-ace-blue/60 max-w-2xl">
                        Stay focused and consistent. {plan.dayName ? `Here is your AI-optimized schedule for ${plan.dayName}.` : "Create a strategy to see your daily schedule."}
                    </p>
                </div>

                <DailyStudyView initialPlan={plan} />
            </main>
        </>
    );
}
