"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { extractGradesFromReport } from "@/lib/actions/grade";
import { Loader2, Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BulkGradeReview } from "@/components/bulk-grade-review";

export function ReportCardUploader() {
    const [isUploading, setIsUploading] = useState(false);
    const [reviewData, setReviewData] = useState<any[]>([]);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [mode, setMode] = useState<"history" | "goals">("history");
    const { toast } = useToast();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const result = await extractGradesFromReport(formData);
            if (result.success && result.data) {
                setReviewData(result.data);
                setIsReviewOpen(true);
            } else {
                toast({ title: "Extraction Failed", description: result.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    }, [toast]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'application/pdf': ['.pdf']
        },
        maxFiles: 1
    });

    return (
        <>
            {/* Style Guide: Card with rounded-3xl, cream background */}
            <div className="border border-ace-blue/10 rounded-3xl p-8 bg-cream-50 shadow-sm hover:shadow-md transition-all duration-300 space-y-6">
                <div className="flex items-center justify-between mb-2">
                    {/* Style Guide: Heading Serif Ace Blue */}
                    <h3 className="font-serif text-2xl font-semibold text-ace-blue flex items-center gap-2">
                        <FileText className="h-6 w-6 text-ace-light" />
                        Report Card Magic
                    </h3>

                    {/* Style Guide: Toggle (pills) */}
                    <div className="flex bg-cream-200/50 rounded-full p-1.5 text-xs font-bold uppercase tracking-wide">
                        <button
                            onClick={() => setMode("history")}
                            className={`px-4 py-1.5 rounded-full transition-all duration-300 ${mode === "history" ? "bg-white text-ace-blue shadow-sm" : "text-ace-blue/50 hover:text-ace-blue"}`}
                        >
                            Log History
                        </button>
                        <button
                            onClick={() => setMode("goals")}
                            className={`px-4 py-1.5 rounded-full transition-all duration-300 ${mode === "goals" ? "bg-white text-ace-blue shadow-sm" : "text-ace-blue/50 hover:text-ace-blue"}`}
                        >
                            Set Goals
                        </button>
                    </div>
                </div>

                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300
                        ${isDragActive ? "border-ace-accent bg-ace-accent/5" : "border-ace-blue/10 hover:border-ace-blue/30 hover:bg-white"}
                    `}
                >
                    <input {...getInputProps()} />
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-ace-accent" />
                            <p className="font-serif text-ace-blue italic text-lg">Analyzing report card...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-ace-blue/60">
                            <div className="p-4 bg-cream-200/50 rounded-full mb-2">
                                <Upload className="h-6 w-6 text-ace-light" />
                            </div>
                            <div>
                                <p className="font-serif text-lg text-ace-blue">Click to upload or drag & drop</p>
                                <p className="text-xs uppercase tracking-widest font-bold mt-1 opacity-60">PDF or Image (PNG, JPG)</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <BulkGradeReview
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                data={reviewData}
                mode={mode}
            />
        </>
    );
}
