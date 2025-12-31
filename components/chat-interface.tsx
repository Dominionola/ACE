"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, Bot, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatInterfaceProps {
    documentId: string;
    documentName: string;
}

export function ChatInterface({ documentId, documentName }: ChatInterfaceProps) {
    const { messages, sendMessage, status, error } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/chat",
            body: { documentId },
        }),
    });

    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
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

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] sm:h-[600px] max-h-[600px] border border-ace-blue/10 rounded-3xl bg-gradient-to-b from-cream-50 to-white shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-ace-blue/10 bg-white/80 backdrop-blur-sm flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-ace-blue to-ace-light rounded-xl shadow-sm">
                    <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="font-serif font-semibold text-ace-blue flex items-center gap-2">
                        AI Study Tutor
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                    </h3>
                    <p className="text-xs text-ace-blue/50 truncate max-w-[120px] sm:max-w-[250px]">
                        Powered by: <span className="font-medium">{documentName}</span>
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div
                className="flex-1 overflow-y-auto p-4 space-y-4"
                ref={scrollRef}
            >
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="p-4 bg-ace-blue/5 rounded-2xl mb-4">
                            <Bot className="h-10 w-10 text-ace-blue/30" />
                        </div>
                        <p className="font-sans text-sm text-ace-blue/50 max-w-xs mb-6">
                            Ask me anything about <br />
                            <span className="font-semibold text-ace-blue/70">{documentName}</span>
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {["Summarize this", "Key concepts", "Explain the main idea"].map((text) => (
                                <button
                                    key={text}
                                    onClick={() => setInput(text)}
                                    className="px-3 py-1.5 text-xs bg-white border border-ace-blue/10 rounded-full text-ace-blue/70 hover:bg-ace-blue/5 transition-colors"
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
                                <AvatarFallback className="bg-gradient-to-br from-ace-blue to-ace-light text-white text-xs font-bold">U</AvatarFallback>
                            ) : (
                                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold text-[10px]">AI</AvatarFallback>
                            )}
                        </Avatar>

                        <div
                            className={`rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${message.role === "user"
                                ? "bg-gradient-to-br from-ace-blue to-ace-light text-white rounded-tr-sm"
                                : "bg-white text-ace-blue rounded-tl-sm border border-ace-blue/5"
                                }`}
                        >
                            {/* Render message parts */}
                            {message.parts?.map((part, index) => {
                                if (part.type === "text") {
                                    return <span key={index}>{part.text}</span>;
                                }
                                return null;
                            })}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3 animate-in fade-in zoom-in duration-300">
                        <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold text-[10px]">AI</AvatarFallback>
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
                    <div className="p-3 mx-auto max-w-sm bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 shadow-sm animate-in slide-in-from-bottom-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-xs font-medium">{error.message}</span>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-ace-blue/10 bg-white/80 backdrop-blur-sm">
                <form
                    onSubmit={onSubmit}
                    className="flex gap-3 items-center"
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question..."
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
    );
}
