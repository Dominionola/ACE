"use client";

import { useState, useEffect } from "react";
import { generateWeeklyReport, getLatestWeeklyReport } from "@/lib/actions/report";
import {
    Sparkles,
    TrendingUp,
    AlertCircle,
    Loader2,
    FileText,
    CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export function WeeklyReportCard() {
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        getLatestWeeklyReport()
            .then(data => {
                setReport(data);
                setLoading(false);
            })
            .catch(() => {
                // On error, just show the "Generate Report" state
                setLoading(false);
            });
    }, []);

    const handleGenerate = async () => {
        setGenerating(true);
        const result = await generateWeeklyReport();
        if (result.success) {
            setReport({ ...result.report, created_at: new Date().toISOString() });
            toast({
                title: "Report Ready!",
                description: "Your AI Coach has analyzed your week.",
            });
            // Reload to get full object if needed, or just use returned report
            getLatestWeeklyReport().then(setReport);
        } else {
            toast({
                title: "Can't Generate Report",
                description: result.error || "Failed to generate report. Try again later.",
                variant: "destructive",
            });
        }
        setGenerating(false);
    };

    if (loading) {
        return <Skeleton className="h-48 w-full rounded-3xl" />;
    }

    if (!report) {
        return (
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-2xl text-white shadow-lg relative overflow-hidden flex flex-col justify-center items-start">
                <div className="relative z-10">
                    <div className="bg-white/20 p-2 rounded-full w-fit mb-2 backdrop-blur-sm">
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                    </div>
                    <h3 className="font-serif text-xl font-bold mb-1">Weekly Coaching</h3>
                    <p className="text-indigo-100 mb-3 text-xs">
                        Get AI-powered insights on your study habits and progress.
                    </p>
                    <Button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="bg-white text-indigo-600 hover:bg-indigo-50 border-0 rounded-full font-bold shadow-md transition-all active:scale-95"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            "Generate Report"
                        )}
                    </Button>
                </div>
                {/* Decor */}
                <Sparkles className="absolute -right-4 -top-4 w-32 h-32 text-white/10 rotate-12" />
            </div>
        );
    }

    // Ensure we parse content if it's stored as JSONB but returned as object or string
    const content = typeof report.report_content === 'string'
        ? JSON.parse(report.report_content)
        : report.report_content;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="group bg-white p-6 rounded-3xl border border-ace-blue/10 shadow-sm hover:shadow-xl transition-all cursor-pointer h-full relative overflow-hidden min-h-[200px] flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <FileText className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-ace-blue/40 bg-ace-blue/5 px-2 py-1 rounded-full">
                            Week {report.week_number}
                        </span>
                    </div>

                    <h3 className="font-serif text-xl text-ace-blue mb-2 group-hover:text-indigo-600 transition-colors">
                        Weekly Review Ready
                    </h3>
                    <p className="text-ace-blue/60 text-sm line-clamp-2 mb-4">
                        {content?.summary ?? "No summary available."}
                    </p>

                    <div className="mt-auto flex items-center text-sm font-medium text-indigo-600 gap-1 group-hover:gap-2 transition-all">
                        View Analysis <TrendingUp className="w-4 h-4" />
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-serif text-2xl flex items-center gap-2 text-ace-blue">
                        <Sparkles className="w-6 h-6 text-indigo-500" />
                        Weekly Coaching Report
                    </DialogTitle>
                    <DialogDescription>
                        Performance analysis for Week {report.week_number}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Summary Section */}
                    <section className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                        <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Advisor Summary
                        </h4>
                        <p className="text-indigo-800/80 leading-relaxed">
                            {content?.summary ?? "No summary available."}
                        </p>
                    </section>

                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Highlights */}
                        <section className="border border-green-100 bg-green-50/50 p-5 rounded-2xl">
                            <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Highlights
                            </h4>
                            <ul className="space-y-2">
                                {content.highlights?.map((item: string, i: number) => (
                                    <li key={i} className="text-sm text-green-900 flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Focus Areas */}
                        <section className="border border-amber-100 bg-amber-50/50 p-5 rounded-2xl">
                            <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Focus for Next Week
                            </h4>
                            <ul className="space-y-2">
                                {content.focus_next_week?.map((item: string, i: number) => (
                                    <li key={i} className="text-sm text-amber-900 flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>

                    <div className="text-center pt-4 border-t">
                        {content?.grade_trend && (
                            <p className="text-xs text-ace-blue/40 uppercase tracking-widest font-bold">
                                Overall Trend: {content.grade_trend}
                            </p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
