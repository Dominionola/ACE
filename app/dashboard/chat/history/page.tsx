import { MessageSquare, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ChatHistoryPage() {
    // Note: Chat history is not currently persisted in the database.
    // This page serves as a placeholder for future implementation.

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 rounded-xl">
                        <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-ace-blue tracking-tight">
                        Chat History
                    </h1>
                </div>
                <p className="text-ace-blue/60 mt-2 text-lg">
                    View your past conversations with the AI Tutor.
                </p>
            </header>

            {/* Coming Soon State */}
            <div className="bg-white rounded-3xl border border-ace-blue/10 shadow-sm p-12 text-center">
                <div className="p-4 bg-purple-50 rounded-2xl inline-block mb-4">
                    <MessageSquare className="h-12 w-12 text-purple-300" />
                </div>
                <h2 className="font-serif text-2xl text-ace-blue mb-2">
                    Coming Soon
                </h2>
                <p className="text-ace-blue/60 max-w-md mx-auto mb-6">
                    Chat history will be available in a future update. For now, each chat session starts fresh.
                </p>
                <Link
                    href="/dashboard/chat"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-ace-blue text-white rounded-full font-medium hover:bg-ace-light transition-all shadow-lg"
                >
                    Start New Chat
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            {/* Feature Preview */}
            <div className="mt-8 p-6 bg-ace-blue/5 rounded-3xl border border-ace-blue/10">
                <h3 className="font-serif text-lg text-ace-blue mb-3">
                    🚀 Planned Features
                </h3>
                <ul className="space-y-2 text-ace-blue/70 font-sans text-sm">
                    <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-ace-accent" />
                        Save and revisit important conversations
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-ace-accent" />
                        Search through past questions and answers
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-ace-accent" />
                        Bookmark key explanations for review
                    </li>
                </ul>
            </div>
        </div>
    );
}
