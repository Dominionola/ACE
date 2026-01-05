"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
    WorkflowEngine,
    WorkflowStage,
    WorkflowState,
    STUDY_SESSION_WORKFLOW,
    getStageDisplayInfo
} from "@/lib/workflows/engine";
import {
    startStudySession,
    getActiveSession,
    updateSessionStage,
    completeSession
} from "@/lib/actions/workflow";

// ============================================
// Types
// ============================================

interface WorkflowContextType {
    // State
    engine: WorkflowEngine | null;
    sessionId: string | null;
    isLoading: boolean;
    hasActiveSession: boolean;

    // Derived state
    currentStage: WorkflowStage | null;
    availableTransitions: WorkflowStage[];
    stageInfo: { title: string; icon: string; color: string } | null;
    sessionDuration: number;

    // Actions
    startSession: () => Promise<boolean>;
    transitionTo: (stage: WorkflowStage) => Promise<boolean>;
    updateState: (updates: Partial<WorkflowState>) => void;
    endSession: () => Promise<boolean>;
    refreshSession: () => Promise<void>;
}

const WorkflowContext = createContext<WorkflowContextType | null>(null);

// ============================================
// Hook
// ============================================

export function useWorkflow() {
    const context = useContext(WorkflowContext);
    if (!context) {
        throw new Error("useWorkflow must be used within a WorkflowProvider");
    }
    return context;
}

export function useWorkflowOptional() {
    return useContext(WorkflowContext);
}

// ============================================
// Provider
// ============================================

interface WorkflowProviderProps {
    children: ReactNode;
}

export function WorkflowProvider({ children }: WorkflowProviderProps) {
    const [engine, setEngine] = useState<WorkflowEngine | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshCounter, setRefreshCounter] = useState(0);

    // Load active session on mount
    useEffect(() => {
        async function loadSession() {
            setIsLoading(true);
            try {
                const result = await getActiveSession();
                if (result.success && result.session) {
                    const restoredEngine = new WorkflowEngine(
                        STUDY_SESSION_WORKFLOW,
                        result.session.session_state as WorkflowState
                    );
                    setEngine(restoredEngine);
                    setSessionId(result.session.id);
                } else {
                    setEngine(null);
                    setSessionId(null);
                }
            } catch (error) {
                console.error("Failed to load session:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadSession();
    }, [refreshCounter]);

    // Derived state
    const hasActiveSession = engine !== null && sessionId !== null;
    const currentStage = engine?.getState().currentStage ?? null;
    const availableTransitions = engine?.getAvailableTransitions() ?? [];
    const stageInfo = currentStage ? getStageDisplayInfo(currentStage) : null;
    const sessionDuration = engine?.getSessionDuration() ?? 0;

    // Actions
    const startSession = useCallback(async (): Promise<boolean> => {
        try {
            const result = await startStudySession();
            if (result.success && result.session) {
                const newEngine = new WorkflowEngine(STUDY_SESSION_WORKFLOW);
                newEngine.startSession(result.session.id);
                setEngine(newEngine);
                setSessionId(result.session.id);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Failed to start session:", error);
            return false;
        }
    }, []);

    const transitionTo = useCallback(async (stage: WorkflowStage): Promise<boolean> => {
        if (!engine || !sessionId) return false;

        const result = engine.transitionTo(stage);
        if (!result.success) {
            console.error(result.error);
            return false;
        }

        // Persist to database
        const dbResult = await updateSessionStage(
            sessionId,
            stage,
            engine.getState()
        );

        if (!dbResult.success) {
            console.error(dbResult.error);
            // Revert local state by refreshing
            setRefreshCounter(c => c + 1);
            return false;
        }

        // Trigger re-render with updated state
        setEngine(new WorkflowEngine(STUDY_SESSION_WORKFLOW, engine.getState()));
        return true;
    }, [engine, sessionId]);

    const updateState = useCallback((updates: Partial<WorkflowState>) => {
        if (!engine) return;
        engine.updateState(updates);
        setEngine(new WorkflowEngine(STUDY_SESSION_WORKFLOW, engine.getState()));
    }, [engine]);

    const endSession = useCallback(async (): Promise<boolean> => {
        if (!sessionId) return false;

        try {
            const result = await completeSession(sessionId);
            if (result.success) {
                setEngine(null);
                setSessionId(null);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Failed to end session:", error);
            return false;
        }
    }, [sessionId]);

    const refreshSession = useCallback(async () => {
        setRefreshCounter(c => c + 1);
    }, []);

    return (
        <WorkflowContext.Provider
            value={{
                engine,
                sessionId,
                isLoading,
                hasActiveSession,
                currentStage,
                availableTransitions,
                stageInfo,
                sessionDuration,
                startSession,
                transitionTo,
                updateState,
                endSession,
                refreshSession,
            }}
        >
            {children}
        </WorkflowContext.Provider>
    );
}
