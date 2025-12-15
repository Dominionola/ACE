import { getCurrentUser } from "@/lib/actions/auth";
import { AppSidebar } from "./app-sidebar";

export async function AppSidebarWrapper() {
    const user = await getCurrentUser();

    const userData = user
        ? {
            name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
            email: user.email || "",
            avatar: user.user_metadata?.avatar_url || "",
        }
        : {
            name: "Guest",
            email: "",
            avatar: "",
        };

    return <AppSidebar user={userData} />;
}
