"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generateStudyStrategy } from "@/lib/actions/strategy";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface StrategyViewProps {
    semester: string;
    existingStrategy: string | null;
}

export function StrategyView({ semester, existingStrategy }: StrategyViewProps) {
    const [strategy, setStrategy] = useState(existingStrategy);
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const handleGenerate = async () => {
        setIsGenerating(true);
        const result = await generateStudyStrategy(semester);
        setIsGenerating(false);

        if (result.success && result.data) {
            setStrategy(result.data);
            toast({ title: "Strategy Generated!", description: "Your personalized study plan is ready." });
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
    };

    return (
        <div className="bg-gradient-to-br from-cream-100 to-cream-50 rounded-3xl border border-ace-blue/5 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-serif font-semibold text-ace-blue flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-amber-500" />
                        AI Study Strategy
                    </h2>
                    <p className="text-ace-blue/60 text-sm mt-1">Get personalized advice based on your performance.</p>
                </div>

                <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="rounded-full bg-ace-blue text-white hover:bg-ace-light shadow-lg"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                        </>
                    ) : strategy ? (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Regenerate
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Strategy
                        </>
                    )}
                </Button>
            </div>

            {strategy ? (
                <div className="prose prose-ace max-w-none bg-white p-6 rounded-2xl border border-ace-blue/5">
                    <ReactMarkdown>{strategy}</ReactMarkdown>
                </div>
            ) : (
                <div className="text-center py-12 text-ace-blue/40">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-serif text-lg italic">No strategy generated yet.</p>
                    <p className="text-sm mt-1">Click the button above to get AI-powered study advice.</p>
                </div>
            )}
        </div>
    );
}
