"use client";

import { useWorkflow } from "@/contexts/workflow-context";
import { WorkflowStage, getStageDisplayInfo } from "@/lib/workflows/engine";
import { Button } from "@/components/ui/button";
import {
    Play,
    ChevronRight,
    Check,
    Clock,
    X,
    Sparkles
} from "lucide-react";

/**
 * Workflow Guide Component
 * 
 * Shows the current study session stage and available transitions.
 * Appears on the dashboard when a session is active.
 */
export function WorkflowGuide() {
    const workflow = useWorkflow();

    if (workflow.isLoading) {
        return (
            <div className="animate-pulse bg-white p-4 rounded-2xl border border-ace-blue/10">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
        );
    }

    // No active session - show start button
    if (!workflow.hasActiveSession) {
        return (
            <div className="bg-gradient-to-r from-ace-blue to-ace-light p-5 rounded-2xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10">
                    <Sparkles className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                    <h3 className="font-serif text-lg font-semibold mb-1">
                        Start a Guided Study Session
                    </h3>
                    <p className="text-white/80 text-sm mb-3">
                        Let ACE guide you through an effective study workflow
                    </p>
                    <Button
                        onClick={() => workflow.startSession()}
                        className="bg-white text-ace-blue hover:bg-white/90 rounded-full shadow-lg"
                    >
                        <Play className="h-4 w-4 mr-2" />
                        Start Session
                    </Button>
                </div>
            </div>
        );
    }

    // Active session - show progress
    const { currentStage, stageInfo, availableTransitions, sessionDuration } = workflow;

    return (
        <div className="bg-white p-5 rounded-2xl border border-ace-blue/10 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="text-2xl">{stageInfo?.icon}</div>
                    <div>
                        <h3 className="font-serif text-lg text-ace-blue font-semibold">
                            {stageInfo?.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-ace-blue/60">
                            <Clock className="h-3 w-3" />
                            {sessionDuration} min
                        </div>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => workflow.endSession()}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Stage Progress */}
            <StageProgress currentStage={currentStage!} />

            {/* Available Actions */}
            {availableTransitions.length > 0 && currentStage !== 'complete' && (
                <div className="mt-4 pt-4 border-t border-ace-blue/10">
                    <p className="text-xs text-ace-blue/60 mb-2">Next steps:</p>
                    <div className="flex flex-wrap gap-2">
                        {availableTransitions.map((stage) => {
                            const info = getStageDisplayInfo(stage);
                            return (
                                <Button
                                    key={stage}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => workflow.transitionTo(stage)}
                                    className="rounded-full text-xs"
                                >
                                    <span className="mr-1">{info.icon}</span>
                                    {info.title}
                                    <ChevronRight className="h-3 w-3 ml-1" />
                                </Button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Complete State */}
            {currentStage === 'complete' && (
                <div className="mt-4 pt-4 border-t border-green-200 bg-green-50 -mx-5 -mb-5 px-5 pb-5 rounded-b-2xl">
                    <div className="flex items-center gap-2 text-green-700">
                        <Check className="h-5 w-5" />
                        <span className="font-medium">Session Complete!</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                        Great work! You studied for {sessionDuration} minutes.
                    </p>
                </div>
            )}
        </div>
    );
}

/**
 * Stage Progress Indicator
 */
function StageProgress({ currentStage }: { currentStage: WorkflowStage }) {
    const stages: WorkflowStage[] = ['browse', 'select', 'active_learn', 'quiz', 'review', 'complete'];
    const currentIndex = stages.indexOf(currentStage);

    return (
        <div className="flex items-center gap-1">
            {stages.map((stage, index) => {
                const info = getStageDisplayInfo(stage);
                const isActive = stage === currentStage;
                const isCompleted = index < currentIndex;

                return (
                    <div key={stage} className="flex items-center flex-1">
                        <div
                            className={`
                                w-full h-1.5 rounded-full transition-colors
                                ${isCompleted ? 'bg-green-500' : ''}
                                ${isActive ? 'bg-ace-blue' : ''}
                                ${!isCompleted && !isActive ? 'bg-gray-200' : ''}
                            `}
                            title={info.title}
                        />
                        {index < stages.length - 1 && (
                            <div className="w-1" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/**
 * Compact version for floating display
 */
export function WorkflowGuideCompact() {
    const workflow = useWorkflow();

    if (!workflow.hasActiveSession || workflow.isLoading) {
        return null;
    }

    const { stageInfo, sessionDuration } = workflow;

    return (
        <div className="fixed bottom-20 left-6 z-40 bg-white rounded-2xl shadow-xl border border-ace-blue/10 p-3 flex items-center gap-3">
            <div className="text-xl">{stageInfo?.icon}</div>
            <div>
                <p className="text-sm font-medium text-ace-blue">{stageInfo?.title}</p>
                <p className="text-xs text-ace-blue/60">{sessionDuration} min</p>
            </div>
        </div>
    );
}
