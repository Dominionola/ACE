import { Settings, User, Sliders, ArrowRight, Cloud } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
    const settingsOptions = [
        {
            title: "Profile",
            description: "Manage your personal information and account details",
            icon: User,
            href: "/dashboard/settings/profile",
            color: "bg-blue-100 text-blue-600",
        },
        {
            title: "Preferences",
            description: "Customize your study experience and notifications",
            icon: Sliders,
            href: "/dashboard/settings/preferences",
            color: "bg-purple-100 text-purple-600",
        },
        {
            title: "Integrations",
            description: "Connect Google Drive and other external services",
            icon: Cloud,
            href: "/dashboard/settings/integrations",
            color: "bg-green-100 text-green-600",
        },
    ];

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-ace-blue/10 rounded-xl">
                        <Settings className="h-6 w-6 text-ace-blue" />
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-ace-blue tracking-tight">
                        Settings
                    </h1>
                </div>
                <p className="text-ace-blue/60 mt-2 text-lg">
                    Manage your account and customize your experience.
                </p>
            </header>

            <div className="grid gap-4 md:grid-cols-2">
                {settingsOptions.map((option) => (
                    <Link
                        key={option.title}
                        href={option.href}
                        className="group bg-white p-6 rounded-3xl border border-ace-blue/10 shadow-sm hover:shadow-lg transition-all"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${option.color}`}>
                                    <option.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="font-serif text-xl text-ace-blue mb-1">
                                        {option.title}
                                    </h2>
                                    <p className="text-sm text-ace-blue/60">
                                        {option.description}
                                    </p>
                                </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-ace-blue/30 group-hover:text-ace-blue group-hover:translate-x-1 transition-all" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
