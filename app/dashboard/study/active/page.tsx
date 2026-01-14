import { WorkflowGuide } from "@/components/workflow-guide";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function ActiveSessionPage() {
    return (
        <div className="flex flex-col h-full min-h-screen">
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
                            <BreadcrumbLink href="/dashboard/study/today">Study</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="font-serif">Active Session</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </header>

            <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full flex flex-col items-center justify-center">
                <div className="w-full max-w-3xl">
                    <div className="mb-8 text-center">
                        <h1 className="font-serif text-3xl text-ace-blue mb-2">
                            Guided Study Session
                        </h1>
                        <p className="font-sans text-ace-blue/60">
                            Follow the workflow to maximize your retention.
                        </p>
                    </div>

                    <WorkflowGuide />
                </div>
            </main>
        </div>
    );
}
