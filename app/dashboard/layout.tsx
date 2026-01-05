import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebarWrapper } from "@/components/app-sidebar-wrapper";
import { TimerProvider } from "@/contexts/timer-context";
import { WorkflowProvider } from "@/contexts/workflow-context";
import { FloatingTimerIsland } from "@/components/floating-timer-island";
import { SessionRecoveryDialog } from "@/components/session-recovery-dialog";
import { WorkflowGuideCompact } from "@/components/workflow-guide";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <TimerProvider>
            <WorkflowProvider>
                <SidebarProvider>
                    <AppSidebarWrapper />
                    <SidebarInset className="bg-cream-50">
                        {children}
                    </SidebarInset>
                </SidebarProvider>
                {/* Floating timer island - appears when timer is running on non-dashboard pages */}
                <FloatingTimerIsland />
                {/* Floating workflow guide - shows current session stage */}
                <WorkflowGuideCompact />
                {/* Session recovery dialog - appears when there's an interrupted session */}
                <SessionRecoveryDialog />
            </WorkflowProvider>
        </TimerProvider>
    );
}
