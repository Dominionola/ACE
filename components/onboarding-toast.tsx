"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

const ONBOARDING_DISMISSED_KEY = "ace_onboarding_dismissed";

export function OnboardingToast() {
    const [isVisible, setIsVisible] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Only show on dashboard routes
        if (!pathname?.startsWith("/dashboard")) return;

        // Check if user has dismissed the onboarding
        const isDismissed = localStorage.getItem(ONBOARDING_DISMISSED_KEY);
        if (isDismissed) return;

        // Show after a short delay for better UX
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 1500);

        return () => clearTimeout(timer);
    }, [pathname]);

    const handleDismiss = () => {
        localStorage.setItem(ONBOARDING_DISMISSED_KEY, "true");
        setIsVisible(false);
    };

    const handleGetStarted = () => {
        localStorage.setItem(ONBOARDING_DISMISSED_KEY, "true");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="bg-white rounded-2xl shadow-2xl border border-ace-blue/10 p-5 max-w-sm">
                {/* Close button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 text-ace-blue/40 hover:text-ace-blue transition-colors"
                    aria-label="Dismiss"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Content */}
                <div className="flex gap-4">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-ace-blue to-ace-light rounded-xl flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-serif font-semibold text-ace-blue mb-1">
                            Welcome to ACE! 🎓
                        </h3>
                        <p className="text-sm text-ace-blue/60 mb-3">
                            Start by adding your courses in <strong>Performance</strong> to unlock personalized study schedules and AI recommendations.
                        </p>
                        <div className="flex gap-2">
                            <Link
                                href="/dashboard/performance"
                                onClick={handleGetStarted}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-ace-blue text-white text-sm font-medium rounded-full hover:bg-ace-light transition-all"
                            >
                                Get Started
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                            <button
                                onClick={handleDismiss}
                                className="px-4 py-2 text-sm text-ace-blue/60 hover:text-ace-blue transition-colors"
                            >
                                Later
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
