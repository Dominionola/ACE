"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, Bot, Loader2, Sparkles, BookOpen } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

export default function ChatPage() {
    const { messages, sendMessage, status, error } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/chat",
            body: { documentId: null }, // General chat, no specific document
        }),
    });

    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || status !== "ready") return;
        sendMessage({ text: input });
        setInput("");
    };

    const isLoading = status !== "ready";

    const quickPrompts = [
        "How do I study more effectively?",
        "Explain the Pomodoro technique",
        "Tips for exam preparation",
        "How to stay focused while studying",
    ];

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <header className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-ace-blue to-ace-light rounded-xl">
                        <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-ace-blue tracking-tight flex items-center gap-2">
                            AI Study Tutor
                            <Sparkles className="h-5 w-5 text-yellow-500" />
                        </h1>
                        <p className="text-ace-blue/60 text-sm">
                            Your personal study companion
                        </p>
                    </div>
                </div>
            </header>

            {/* Tip Banner */}
            <div className="mb-6 p-4 bg-ace-blue/5 rounded-2xl border border-ace-blue/10 flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-ace-blue/60 flex-shrink-0" />
                <p className="text-sm text-ace-blue/70">
                    <strong>Pro tip:</strong> For document-specific questions, open a deck and chat with your uploaded materials.{" "}
                    <Link href="/dashboard/decks" className="text-ace-accent hover:underline">
                        Go to Decks →
                    </Link>
                </p>
            </div>

            {/* Chat Container */}
            <div className="flex flex-col h-[calc(100vh-320px)] min-h-[400px] border border-ace-blue/10 rounded-3xl bg-gradient-to-b from-cream-50 to-white shadow-lg overflow-hidden">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="p-4 bg-ace-blue/5 rounded-2xl mb-4">
                                <Bot className="h-12 w-12 text-ace-blue/30" />
                            </div>
                            <p className="font-serif text-lg text-ace-blue/70 mb-2">
                                How can I help you study today?
                            </p>
                            <p className="font-sans text-sm text-ace-blue/50 max-w-sm mb-6">
                                Ask me anything about study techniques, exam prep, or learning strategies.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center max-w-md">
                                {quickPrompts.map((text) => (
                                    <button
                                        key={text}
                                        onClick={() => setInput(text)}
                                        className="px-3 py-2 text-xs bg-white border border-ace-blue/10 rounded-full text-ace-blue/70 hover:bg-ace-blue/5 transition-colors"
                                    >
                                        {text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-3 animate-fade-in ${message.role === "user" ? "flex-row-reverse" : "flex-row"
                                }`}
                        >
                            <Avatar className="h-8 w-8 border-2 border-white shadow-sm flex-shrink-0">
                                {message.role === "user" ? (
                                    <AvatarFallback className="bg-gradient-to-br from-ace-blue to-ace-light text-white text-xs font-bold">
                                        U
                                    </AvatarFallback>
                                ) : (
                                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold text-[10px]">
                                        AI
                                    </AvatarFallback>
                                )}
                            </Avatar>

                            <div
                                className={`rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${message.role === "user"
                                    ? "bg-gradient-to-br from-ace-blue to-ace-light text-white rounded-tr-sm"
                                    : "bg-white text-ace-blue rounded-tl-sm border border-ace-blue/5"
                                    }`}
                            >
                                {message.parts?.map((part, index) => {
                                    if (part.type === "text") {
                                        return <span key={index}>{part.text}</span>;
                                    }
                                    // Log unhandled part types for debugging
                                    if (process.env.NODE_ENV === "development") {
                                        console.warn("Unhandled message part type:", part.type);
                                    }
                                    return null;
                                })}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-3">
                            <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold text-[10px]">
                                    AI
                                </AvatarFallback>
                            </Avatar>
                            <div className="bg-white rounded-2xl px-4 py-3 rounded-tl-sm border border-ace-blue/5 shadow-sm">
                                <div className="flex items-center gap-2 text-ace-blue/50">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    <span className="text-xs font-medium">Thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 mx-auto max-w-sm bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 shadow-sm">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            <span className="text-xs font-medium">{error.message}</span>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-ace-blue/10 bg-white/80 backdrop-blur-sm">
                    <form onSubmit={onSubmit} className="flex gap-3 items-center">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a study question..."
                            className="flex-1 h-12 px-5 rounded-full border-ace-blue/10 bg-cream-50/50 text-ace-blue placeholder:text-ace-blue/30 focus-visible:ring-2 focus-visible:ring-ace-blue/20 focus-visible:border-ace-blue/20 transition-all font-sans"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || !input.trim()}
                            className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-ace-blue to-ace-light hover:from-ace-light hover:to-ace-blue text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5 ml-0.5" />
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
