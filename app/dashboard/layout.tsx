import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebarWrapper } from "@/components/app-sidebar-wrapper";
import { TimerProvider } from "@/contexts/timer-context";
import { FloatingTimerIsland } from "@/components/floating-timer-island";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <TimerProvider>
            <SidebarProvider>
                <AppSidebarWrapper />
                <SidebarInset className="bg-cream-50">
                    {children}
                </SidebarInset>
            </SidebarProvider>
            {/* Floating timer island - appears when timer is running on non-dashboard pages */}
            <FloatingTimerIsland />
        </TimerProvider>
    );
}
