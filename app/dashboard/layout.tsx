import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebarWrapper } from "@/components/app-sidebar-wrapper";
import { OnboardingToast } from "@/components/onboarding-toast";
import { FloatingTimerIsland } from "@/components/floating-timer-island";
import { SessionRecoveryDialog } from "@/components/session-recovery-dialog";
import { WorkflowGuideCompact } from "@/components/workflow-guide";
import { CoachPrompt } from "@/components/coach-prompt";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <AppSidebarWrapper />
            <SidebarInset className="bg-cream-50">
                {children}
            </SidebarInset>
            {/* Dashboard-only floating elements */}
            <FloatingTimerIsland />
            <WorkflowGuideCompact />
            <SessionRecoveryDialog />
            <CoachPrompt />
            <OnboardingToast />
        </SidebarProvider>
    );
}
