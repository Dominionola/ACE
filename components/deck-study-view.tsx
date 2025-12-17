"use client";

import { useState } from "react";
import { Document } from "@/lib/schemas/document";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/components/file-upload";
import { ChatInterface } from "@/components/chat-interface";
import { FileText, MessageSquare, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteDocument } from "@/lib/actions/document";
import { DeckCard } from "@/components/deck-card";
import { QuizDialog } from "@/components/quiz-dialog";

interface DeckStudyViewProps {
    deck: any; // Ideally import Deck type
    documents: Document[];
    userId: string;
}

export function DeckStudyView({ deck, documents, userId }: DeckStudyViewProps) {
    const [activeTab, setActiveTab] = useState("materials");
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

    const selectedDocument = documents.find((d) => d.id === selectedDocumentId);

    const handleChatParams = (docId: string) => {
        setSelectedDocumentId(docId);
        setActiveTab("chat");
    };

    const handleDelete = async (docId: string) => {
        if (confirm("Are you sure you want to delete this document?")) {
            await deleteDocument(docId, deck.id);
        }
    };

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-6">
                    <TabsTrigger value="materials">Study Materials</TabsTrigger>
                    <TabsTrigger value="chat">AI Chat</TabsTrigger>
                </TabsList>

                {/* Study Materials Tab */}
                <TabsContent value="materials" className="space-y-6">
                    {/* Upload Section */}
                    <div className="bg-white p-6 rounded-3xl border border-ace-blue/10 shadow-sm">
                        <h2 className="font-serif text-xl text-ace-blue mb-4 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 opacity-60" />
                            Upload Documents
                        </h2>
                        <FileUpload deckId={deck.id} />
                    </div>

                    {/* Documents List */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {documents.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-ace-blue/40 font-sans italic">
                                No documents uploaded yet.
                            </div>
                        ) : (
                            documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="group relative bg-white border border-ace-blue/10 rounded-2xl p-4 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-2 bg-cream-100 rounded-lg">
                                            <FileText className="h-6 w-6 text-ace-blue/60" />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(doc.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <h3 className="font-medium text-ace-blue truncate mb-1" title={doc.file_name}>
                                        {doc.file_name}
                                    </h3>
                                    <p className="text-xs text-ace-blue/40 mb-4">
                                        Extracted • {new Date().toLocaleDateString()}
                                    </p>

                                    <div className="flex flex-col gap-2">
                                        <Button
                                            onClick={() => handleChatParams(doc.id)}
                                            className="w-full bg-ace-blue text-white rounded-full hover:bg-ace-light gap-2"
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                            Chat with PDF
                                        </Button>
                                        <QuizDialog documentId={doc.id} deckId={deck.id} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* AI Chat Tab */}
                <TabsContent value="chat">
                    {selectedDocumentId && selectedDocument ? (
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Document Sidebar (visible on large screens) */}
                            <div className="hidden lg:block space-y-4">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2"
                                    onClick={() => setActiveTab("materials")}
                                >
                                    ← Back to Documents
                                </Button>
                                <div className="bg-white p-4 rounded-2xl border border-ace-blue/10">
                                    <p className="text-xs font-semibold text-ace-blue/40 uppercase mb-2">Active Document</p>
                                    <div className="flex items-center gap-2 text-ace-blue">
                                        <FileText className="h-4 w-4" />
                                        <span className="truncate font-medium text-sm">{selectedDocument.file_name}</span>
                                    </div>
                                </div>
                                {/* List other docs to switch? maybe later */}
                            </div>

                            {/* Chat Interface */}
                            <div className="lg:col-span-2">
                                <ChatInterface
                                    documentId={selectedDocumentId}
                                    documentName={selectedDocument.file_name}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-ace-border/10">
                            <MessageSquare className="h-12 w-12 text-ace-blue/20 mx-auto mb-4" />
                            <h3 className="font-serif text-xl text-ace-blue mb-2">Select a Document to Chat</h3>
                            <p className="text-ace-blue/60 mb-6 max-w-sm mx-auto">
                                Go to the <strong>Study Materials</strong> tab and click "Chat with PDF" on any document to start an AI session.
                            </p>
                            <Button onClick={() => setActiveTab("materials")}>
                                Browse Documents
                            </Button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
