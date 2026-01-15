"use client";

import { useState } from "react";
import { Tag, Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { updateCardTag } from "@/lib/actions/card";
import { useToast } from "@/hooks/use-toast";

interface CardTagSelectorProps {
    cardId: string;
    currentTag?: string | null;
    existingTags: string[];
    onTagUpdated?: () => void;
}

const TAG_COLORS: Record<string, string> = {
    "Chapter 1": "bg-blue-100 text-blue-700",
    "Chapter 2": "bg-green-100 text-green-700",
    "Chapter 3": "bg-purple-100 text-purple-700",
    "Important": "bg-red-100 text-red-700",
    "Review": "bg-amber-100 text-amber-700",
    "Formulas": "bg-cyan-100 text-cyan-700",
    "Definitions": "bg-pink-100 text-pink-700",
    "Examples": "bg-indigo-100 text-indigo-700",
};

function getTagColor(tag: string) {
    return TAG_COLORS[tag] || "bg-gray-100 text-gray-700";
}

export function CardTagSelector({ cardId, currentTag, existingTags, onTagUpdated }: CardTagSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [newTag, setNewTag] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSelectTag = async (tag: string | null) => {
        setIsLoading(true);
        const result = await updateCardTag(cardId, tag);

        if (result.success) {
            toast({
                title: tag ? "Tag Updated" : "Tag Removed",
                description: tag ? `Card tagged as "${tag}"` : "Tag removed from card",
            });
            onTagUpdated?.();
            setIsOpen(false);
        } else {
            toast({
                title: "Error",
                description: result.error || "Failed to update tag",
                variant: "destructive",
            });
        }
        setIsLoading(false);
    };

    const handleAddNewTag = async () => {
        if (!newTag.trim()) return;
        await handleSelectTag(newTag.trim());
        setNewTag("");
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 gap-1.5 text-xs rounded-full ${currentTag ? getTagColor(currentTag) : "text-ace-blue/50 hover:text-ace-blue"
                        }`}
                >
                    <Tag className="h-3 w-3" />
                    {currentTag || "Add tag"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
                <div className="space-y-2">
                    <p className="text-xs font-medium text-ace-blue/60 px-2">Select or create a tag</p>

                    {/* Existing tags */}
                    <div className="space-y-1">
                        {existingTags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => handleSelectTag(tag)}
                                disabled={isLoading}
                                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-sm hover:bg-cream-50 transition-colors ${currentTag === tag ? "bg-cream-100" : ""
                                    }`}
                            >
                                <span className={`px-2 py-0.5 rounded-full text-xs ${getTagColor(tag)}`}>
                                    {tag}
                                </span>
                                {currentTag === tag && <Check className="h-3.5 w-3.5 text-green-600" />}
                            </button>
                        ))}
                    </div>

                    {/* New tag input */}
                    <div className="flex gap-1.5 pt-2 border-t border-ace-blue/10">
                        <Input
                            placeholder="New tag..."
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddNewTag()}
                            className="h-8 text-sm"
                        />
                        <Button
                            size="sm"
                            onClick={handleAddNewTag}
                            disabled={!newTag.trim() || isLoading}
                            className="h-8 w-8 p-0"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Remove tag option */}
                    {currentTag && (
                        <button
                            onClick={() => handleSelectTag(null)}
                            disabled={isLoading}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                            Remove tag
                        </button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
