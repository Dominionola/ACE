import { Cloud, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { isGoogleDriveConnected } from "@/lib/actions/google-drive";

export default async function IntegrationsPage() {
    const driveStatus = await isGoogleDriveConnected();

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-xl">
                        <Cloud className="h-6 w-6 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-ace-blue tracking-tight">
                        Integrations
                    </h1>
                </div>
                <p className="text-ace-blue/60 mt-2 text-lg">
                    Connect external services to enhance your study experience.
                </p>
            </header>

            {/* Google Drive Integration */}
            <div className="bg-white rounded-3xl border border-ace-blue/10 shadow-sm overflow-hidden">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl">
                            <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7.71 3.5L1.15 15l3.43 5.93h13.32l3.43-5.93L14.77 3.5H7.71zm.79 1h5.01l5.93 10.25-2.87 4.97H4.92l-2.87-4.97L7.98 4.5h.52zM12 8l-3.5 6h7L12 8z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="font-serif text-xl text-ace-blue">Google Drive</h2>
                                {driveStatus.connected && (
                                    <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                        <CheckCircle className="h-3 w-3" />
                                        Connected
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-ace-blue/60 mb-4">
                                Import PDFs directly from your Google Drive. Keep your documents in the cloud without re-uploading.
                            </p>

                            {driveStatus.connected ? (
                                <div className="space-y-3">
                                    <p className="text-sm text-ace-blue/70">
                                        Connected as: <span className="font-medium">{driveStatus.email ?? "Unknown"}</span>
                                    </p>                                    <form action="/api/auth/google/disconnect" method="POST">
                                        <button
                                            type="submit"
                                            className="text-sm text-red-600 hover:text-red-700 hover:underline"
                                        >
                                            Disconnect Google Drive
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <Link
                                    href="/api/auth/google"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-ace-blue text-white rounded-full hover:bg-ace-light transition-colors text-sm font-medium"
                                >
                                    Connect Google Drive
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Features List */}
                <div className="px-6 pb-6">
                    <div className="bg-cream-50 rounded-2xl p-4">
                        <p className="text-xs font-semibold text-ace-blue/40 uppercase tracking-wider mb-3">Features</p>
                        <ul className="space-y-2 text-sm text-ace-blue/70">
                            <li className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-ace-blue/40" />
                                Import PDFs without re-uploading
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-ace-blue/40" />
                                Original document quality preserved
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-ace-blue/40" />
                                Access your Drive files directly
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Back Link */}
            <div className="mt-6">
                <Link
                    href="/dashboard/settings"
                    className="text-sm text-ace-blue/60 hover:text-ace-blue"
                >
                    ← Back to Settings
                </Link>
            </div>
        </div>
    );
}
