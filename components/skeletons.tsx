"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DeckCardSkeleton() {
    return (
        <div className="bg-white p-6 rounded-3xl border border-ace-blue/10 shadow-sm animate-pulse">
            <div className="flex items-start justify-between mb-4">
                <Skeleton className="h-6 w-3/5 bg-cream-200" />
                <Skeleton className="h-6 w-16 bg-cream-200 rounded-full" />
            </div>
            <Skeleton className="h-4 w-4/5 bg-cream-100 mb-2" />
            <Skeleton className="h-4 w-2/3 bg-cream-100" />
            <div className="flex gap-2 mt-4">
                <Skeleton className="h-8 w-20 bg-cream-200 rounded-full" />
                <Skeleton className="h-8 w-20 bg-cream-200 rounded-full" />
            </div>
        </div>
    );
}

export function GradeRowSkeleton() {
    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-ace-blue/5 animate-pulse">
            <div className="flex-1">
                <Skeleton className="h-5 w-32 bg-cream-200 mb-2" />
                <Skeleton className="h-4 w-20 bg-cream-100" />
            </div>
            <Skeleton className="h-8 w-16 bg-cream-200 rounded-full" />
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="bg-white p-6 rounded-3xl border border-ace-blue/10 shadow-sm animate-pulse">
            <Skeleton className="h-6 w-48 bg-cream-200 mb-6" />
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-4 w-20 bg-cream-100" />
                        <Skeleton className="h-6 flex-1 bg-cream-200 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DeckListSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <DeckCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function GradeListSkeleton() {
    return (
        <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
                <GradeRowSkeleton key={i} />
            ))}
        </div>
    );
}
