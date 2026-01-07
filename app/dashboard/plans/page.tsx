import { Suspense } from "react";
import { getActivePlans } from "@/lib/actions/plans";
import { GoalSetter } from "@/components/goal-setter";
import { StudyPlanView } from "@/components/study-plan-view";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Map as MapIcon } from "lucide-react";

export default async function PlansPage() {
    const plans = await getActivePlans();

    return (
        <div className="flex flex-col h-screen bg-cream-50">
            {/* Header */}
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4 bg-white sticky top-0 z-10">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="flex items-center gap-2 font-serif font-bold text-ace-blue">
                    <MapIcon className="h-5 w-5" />
                    Study Plans
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Hero / Action Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                        <div>
                            <h1 className="text-3xl font-serif text-ace-blue font-bold mb-2">Your Roadmap</h1>
                            <p className="text-ace-blue/60 max-w-lg">
                                Set a goal, and ACE will generate a structured study timeline to help you crush it.
                            </p>
                        </div>
                        <GoalSetter />
                    </div>

                    {/* Active Plans */}
                    <Suspense fallback={<PlansSkeleton />}>
                        {plans.length > 0 ? (
                            <div className="space-y-8">
                                {plans.map((plan: any) => (
                                    <StudyPlanView key={plan.id} plan={plan} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState />
                        )}
                    </Suspense>
                </div>
            </main>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-ace-blue/10 rounded-3xl bg-white/50">
            <div className="bg-ace-blue/5 p-4 rounded-full mb-4">
                <MapIcon className="h-8 w-8 text-ace-blue/40" />
            </div>
            <h3 className="text-xl font-serif text-ace-blue mb-2">No active plans</h3>
            <p className="text-ace-blue/60 max-w-sm mb-6">
                You haven't set any study goals yet. Create a plan to get a personalized schedule.
            </p>
            <GoalSetter />
        </div>
    );
}

function PlansSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
    );
}
