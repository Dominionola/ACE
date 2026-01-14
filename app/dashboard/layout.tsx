import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebarWrapper } from "@/components/app-sidebar-wrapper";
import { OnboardingToast } from "@/components/onboarding-toast";

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
            <OnboardingToast />
        </SidebarProvider>
    );
}

