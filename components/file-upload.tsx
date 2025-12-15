"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Loader2, Check } from "lucide-react";
import { uploadDocument } from "@/lib/actions/document";

interface FileUploadProps {
    deckId: string;
    onUploadComplete?: () => void;
}

export function FileUpload({ deckId, onUploadComplete }: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            if (acceptedFiles.length === 0) return;

            const file = acceptedFiles[0];
            setIsUploading(true);
            setUploadStatus("idle");
            setError(null);

            const formData = new FormData();
            formData.append("file", file);

            const result = await uploadDocument(deckId, formData);

            if (result.success) {
                setUploadStatus("success");
                onUploadComplete?.();
                // Reset after showing success
                setTimeout(() => {
                    setUploadStatus("idle");
                }, 2000);
            } else {
                setUploadStatus("error");
                setError(result.error || "Upload failed");
            }

            setIsUploading(false);
        },
        [deckId, onUploadComplete]
    );

    const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 1,
        disabled: isUploading,
    });

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-300
          ${isDragActive ? "border-ace-blue bg-ace-blue/5 scale-[1.02]" : "border-ace-blue/20 hover:border-ace-blue/40"}
          ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
          ${uploadStatus === "success" ? "border-green-500 bg-green-50" : ""}
          ${uploadStatus === "error" ? "border-red-500 bg-red-50" : ""}
        `}
            >
                <input {...getInputProps()} />

                {isUploading ? (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-10 w-10 text-ace-blue animate-spin" />
                        <p className="font-sans text-ace-blue">Processing your document...</p>
                    </div>
                ) : uploadStatus === "success" ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-full">
                            <Check className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="font-sans text-green-700">Document uploaded successfully!</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-ace-blue/5 rounded-full">
                            {isDragActive ? (
                                <FileText strokeWidth={1.5} className="h-8 w-8 text-ace-blue" />
                            ) : (
                                <Upload strokeWidth={1.5} className="h-8 w-8 text-ace-blue/60" />
                            )}
                        </div>
                        <div>
                            <p className="font-sans text-ace-blue font-medium">
                                {isDragActive ? "Drop your PDF here" : "Drag & drop a PDF file"}
                            </p>
                            <p className="font-sans text-sm text-ace-blue/50 mt-1">
                                or click to browse (max 10MB)
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <X className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
