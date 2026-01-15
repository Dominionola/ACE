"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Cloud, FileText, Loader2, ExternalLink, Download, AlertCircle } from "lucide-react";
import { listGoogleDriveFiles, importFromGoogleDrive, isGoogleDriveConnected } from "@/lib/actions/google-drive";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface DriveFile {
    id: string;
    name: string;
    size?: string;
    modifiedTime?: string;
    webViewLink?: string;
}

interface GoogleDrivePickerProps {
    deckId: string;
    onImportComplete?: () => void;
}

export function GoogleDrivePicker({ deckId, onImportComplete }: GoogleDrivePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [importingFileId, setImportingFileId] = useState<string | null>(null);
    const { toast } = useToast();

    // Check connection status when dialog opens
    useEffect(() => {
        if (isOpen) {
            checkConnectionAndLoadFiles();
        }
    }, [isOpen]);

    const checkConnectionAndLoadFiles = async () => {
        setIsLoading(true);
        try {
            const status = await isGoogleDriveConnected();
            setIsConnected(status.connected);

            if (status.connected) {
                const result = await listGoogleDriveFiles();
                if (result.success) {
                    setFiles(result.files);
                } else {
                    toast({
                        title: "Error",
                        description: result.error || "Failed to load files",
                        variant: "destructive",
                    });
                }
            }
        } catch (error) {
            console.error("Failed to check connection or load files:", error);
            toast({
                title: "Error",
                description: "Failed to connect to Google Drive",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };
    const handleImport = async (file: DriveFile) => {
        setImportingFileId(file.id);
        try {
            const result = await importFromGoogleDrive(file.id, deckId);

            if (result.success) {
                toast({
                    title: "Imported!",
                    description: `${file.name} has been added to your deck.`,
                });
                setIsOpen(false);
                onImportComplete?.();
            } else {
                toast({
                    title: "Import Failed",
                    description: result.error || "Something went wrong",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Import failed:", error);
            toast({
                title: "Import Failed",
                description: "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setImportingFileId(null);
        }
    };
    const formatFileSize = (bytes?: string) => {
        if (!bytes) return "";
        const size = parseInt(bytes);
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full rounded-full gap-2 border-green-300 text-green-700 hover:bg-green-50"
                >
                    <Cloud className="h-4 w-4" />
                    Import from Google Drive
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Cloud className="h-5 w-5 text-green-600" />
                        Import from Google Drive
                    </DialogTitle>
                    <DialogDescription>
                        Select a PDF file from your Google Drive to import.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto min-h-[200px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-ace-blue/40 mb-3" />
                            <p className="text-sm text-ace-blue/60">Loading your files...</p>
                        </div>
                    ) : isConnected === false ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <AlertCircle className="h-10 w-10 text-amber-500 mb-3" />
                            <h3 className="font-medium text-ace-blue mb-2">Google Drive Not Connected</h3>
                            <p className="text-sm text-ace-blue/60 mb-4 max-w-xs">
                                Connect your Google Drive to import PDFs directly.
                            </p>
                            <Link href="/dashboard/settings/integrations">
                                <Button className="rounded-full">
                                    Connect Google Drive
                                </Button>
                            </Link>
                        </div>
                    ) : files.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <FileText className="h-10 w-10 text-ace-blue/20 mb-3" />
                            <h3 className="font-medium text-ace-blue mb-2">No PDFs Found</h3>
                            <p className="text-sm text-ace-blue/60">
                                No PDF files were found in your Google Drive.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex items-center gap-3 p-3 rounded-xl border border-ace-blue/10 hover:border-ace-blue/30 hover:bg-cream-50 transition-colors"
                                >
                                    <div className="p-2 bg-red-50 rounded-lg">
                                        <FileText className="h-5 w-5 text-red-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-ace-blue truncate text-sm">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-ace-blue/50">
                                            {formatFileSize(file.size)} • {formatDate(file.modifiedTime)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {file.webViewLink && (
                                            <a
                                                href={file.webViewLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-ace-blue/40 hover:text-ace-blue"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        )}
                                        <Button
                                            size="sm"
                                            onClick={() => handleImport(file)}
                                            disabled={importingFileId !== null}
                                            className="rounded-full h-8 px-3"
                                        >
                                            {importingFileId === file.id ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <>
                                                    <Download className="h-3.5 w-3.5 mr-1" />
                                                    Import
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
