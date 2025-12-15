"use client";

import { useChat } from "ai/react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatInterfaceProps {
    documentId: string;
    documentName: string;
}

export function ChatInterface({ documentId, documentName }: ChatInterfaceProps) {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        body: {
            documentId,
        },
    });

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-[600px] border border-ace-blue/10 rounded-3xl bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-ace-blue/10 bg-cream-50/50 flex items-center gap-2">
                <div className="p-2 bg-ace-blue/10 rounded-full">
                    <Bot className="h-5 w-5 text-ace-blue" />
                </div>
                <div>
                    <h3 className="font-serif font-medium text-ace-blue">AI Tutor</h3>
                    <p className="text-xs text-ace-blue/60 truncate max-w-[200px]">
                        Context: {documentName}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-ace-blue/40">
                        <Bot className="h-12 w-12 mb-4 opacity-50" />
                        <p className="font-sans text-sm">
                            Ask me anything about <br />
                            <span className="font-medium text-ace-blue/60">{documentName}</span>
                        </p>
                    </div>
                )}

                {messages.map((m) => (
                    <div
                        key={m.id}
                        className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"
                            }`}
                    >
                        <Avatar className="h-8 w-8 border border-ace-blue/10">
                            {m.role === "user" ? (
                                <>
                                    <AvatarImage src="/user-avatar-placeholder.png" />
                                    <AvatarFallback className="bg-ace-blue text-white">U</AvatarFallback>
                                </>
                            ) : (
                                <>
                                    <AvatarFallback className="bg-green-600 text-white">AI</AvatarFallback>
                                </>
                            )}
                        </Avatar>

                        <div
                            className={`rounded-2xl p-4 max-w-[80%] text-sm leading-relaxed ${m.role === "user"
                                    ? "bg-ace-blue text-white rounded-tr-none"
                                    : "bg-cream-100 text-ace-blue rounded-tl-none border border-ace-blue/5"
                                }`}
                        >
                            {m.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                        <Avatar className="h-8 w-8 border border-ace-blue/10">
                            <AvatarFallback className="bg-green-600 text-white">AI</AvatarFallback>
                        </Avatar>
                        <div className="bg-cream-100 rounded-2xl p-4 rounded-tl-none border border-ace-blue/5 flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin text-ace-blue/40" />
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-ace-blue/10 bg-white">
                <form onSubmit={handleSubmit} className="flex gap-2 relative">
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask a question..."
                        className="pr-12 rounded-full border-ace-blue/20 focus-visible:ring-ace-blue/20 bg-cream-50/30"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-1 top-1 h-8 w-8 rounded-full bg-ace-blue hover:bg-ace-light text-white"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
