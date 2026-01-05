/**
 * Agentic Study Workflow Engine
 * 
 * This module defines the workflow stages, transitions, and execution logic
 * for structured study sessions in ACE.
 */

// ============================================
// Types
// ============================================

export type WorkflowStage =
    | 'browse'        // Browse/search topics
    | 'select'        // Select focus area
    | 'active_learn'  // Active learning (flashcards, reading)
    | 'quiz'          // Take a quiz
    | 'review'        // Review mistakes
    | 'reflect'       // Reflect and update strategy
    | 'complete';     // Session complete

export interface WorkflowState {
    currentStage: WorkflowStage;
    sessionId: string | null;
    selectedTopic: string | null;
    topicsCovered: string[];
    quizScore: number | null;
    mistakes: string[];
    startedAt: Date | null;
    lastActivity: Date;
}

export interface StageDefinition {
    name: WorkflowStage;
    description: string;
    allowedTransitions: WorkflowStage[];
    prerequisites?: (state: WorkflowState) => boolean;
    onEnter?: (state: WorkflowState) => Partial<WorkflowState>;
    onExit?: (state: WorkflowState) => Partial<WorkflowState>;
}

// ============================================
// Workflow Definition
// ============================================

export const STUDY_SESSION_WORKFLOW: Record<WorkflowStage, StageDefinition> = {
    browse: {
        name: 'browse',
        description: 'Browse and search for study topics',
        allowedTransitions: ['select', 'complete'],
    },
    select: {
        name: 'select',
        description: 'Select your focus area for this session',
        allowedTransitions: ['active_learn', 'browse'],
        onEnter: (state) => ({ lastActivity: new Date() }),
    },
    active_learn: {
        name: 'active_learn',
        description: 'Active learning with flashcards and materials',
        allowedTransitions: ['quiz', 'review', 'complete'],
        prerequisites: (state) => state.selectedTopic !== null,
    },
    quiz: {
        name: 'quiz',
        description: 'Test your knowledge with a quiz',
        allowedTransitions: ['review', 'reflect', 'complete'],
        prerequisites: (state) => state.selectedTopic !== null,
    },
    review: {
        name: 'review',
        description: 'Review your mistakes and weak areas',
        allowedTransitions: ['active_learn', 'quiz', 'reflect'],
        prerequisites: (state) => state.quizScore !== null || state.mistakes.length > 0,
    },
    reflect: {
        name: 'reflect',
        description: 'Reflect on your progress and update strategy',
        allowedTransitions: ['browse', 'complete'],
    },
    complete: {
        name: 'complete',
        description: 'Session complete',
        allowedTransitions: [],
    },
};

// ============================================
// Workflow Engine
// ============================================

export class WorkflowEngine {
    private state: WorkflowState;
    private workflow: Record<WorkflowStage, StageDefinition>;

    constructor(
        workflow: Record<WorkflowStage, StageDefinition> = STUDY_SESSION_WORKFLOW,
        initialState?: Partial<WorkflowState>
    ) {
        this.workflow = workflow;
        this.state = {
            currentStage: 'browse',
            sessionId: null,
            selectedTopic: null,
            topicsCovered: [],
            quizScore: null,
            mistakes: [],
            startedAt: null,
            lastActivity: new Date(),
            ...initialState,
        };
    }

    /**
     * Get the current workflow state
     */
    getState(): WorkflowState {
        return { ...this.state };
    }

    /**
     * Get the current stage definition
     */
    getCurrentStage(): StageDefinition {
        return this.workflow[this.state.currentStage];
    }

    /**
     * Get available transitions from current stage
     */
    getAvailableTransitions(): WorkflowStage[] {
        const currentStage = this.getCurrentStage();
        return currentStage.allowedTransitions.filter(stage => {
            const targetStage = this.workflow[stage];
            if (targetStage.prerequisites) {
                return targetStage.prerequisites(this.state);
            }
            return true;
        });
    }

    /**
     * Check if a transition is valid
     */
    canTransitionTo(targetStage: WorkflowStage): boolean {
        return this.getAvailableTransitions().includes(targetStage);
    }

    /**
     * Transition to a new stage
     */
    transitionTo(targetStage: WorkflowStage): { success: boolean; error?: string } {
        if (!this.canTransitionTo(targetStage)) {
            return {
                success: false,
                error: `Cannot transition from ${this.state.currentStage} to ${targetStage}`
            };
        }

        const currentStageDef = this.getCurrentStage();
        const targetStageDef = this.workflow[targetStage];

        // Execute onExit for current stage
        if (currentStageDef.onExit) {
            const updates = currentStageDef.onExit(this.state);
            this.state = { ...this.state, ...updates };
        }

        // Update stage
        this.state.currentStage = targetStage;
        this.state.lastActivity = new Date();

        // Execute onEnter for new stage
        if (targetStageDef.onEnter) {
            const updates = targetStageDef.onEnter(this.state);
            this.state = { ...this.state, ...updates };
        }

        return { success: true };
    }

    /**
     * Update state properties
     */
    updateState(updates: Partial<WorkflowState>): void {
        this.state = { ...this.state, ...updates, lastActivity: new Date() };
    }

    /**
     * Start a new session
     */
    startSession(sessionId: string): void {
        this.state.sessionId = sessionId;
        this.state.startedAt = new Date();
        this.state.currentStage = 'browse';
    }

    /**
     * Complete the session
     */
    completeSession(): void {
        this.transitionTo('complete');
    }

    /**
     * Check if session is complete
     */
    isComplete(): boolean {
        return this.state.currentStage === 'complete';
    }

    /**
     * Get session duration in minutes
     */
    getSessionDuration(): number {
        if (!this.state.startedAt) return 0;
        return Math.floor((new Date().getTime() - this.state.startedAt.getTime()) / 60000);
    }

    /**
     * Serialize state for persistence
     */
    serialize(): string {
        return JSON.stringify({
            ...this.state,
            startedAt: this.state.startedAt?.toISOString(),
            lastActivity: this.state.lastActivity.toISOString(),
        });
    }

    /**
     * Restore state from serialized data
     */
    static deserialize(data: string): WorkflowEngine {
        const parsed = JSON.parse(data);
        return new WorkflowEngine(STUDY_SESSION_WORKFLOW, {
            ...parsed,
            startedAt: parsed.startedAt ? new Date(parsed.startedAt) : null,
            lastActivity: new Date(parsed.lastActivity),
        });
    }
}

// ============================================
// Helper Functions
// ============================================

export function getStageDisplayInfo(stage: WorkflowStage): {
    title: string;
    icon: string;
    color: string;
} {
    const info: Record<WorkflowStage, { title: string; icon: string; color: string }> = {
        browse: { title: 'Browse Topics', icon: '🔍', color: 'blue' },
        select: { title: 'Select Focus', icon: '🎯', color: 'purple' },
        active_learn: { title: 'Active Learning', icon: '📚', color: 'green' },
        quiz: { title: 'Quiz Time', icon: '❓', color: 'orange' },
        review: { title: 'Review', icon: '🔄', color: 'yellow' },
        reflect: { title: 'Reflect', icon: '💭', color: 'indigo' },
        complete: { title: 'Complete', icon: '✅', color: 'emerald' },
    };
    return info[stage];
}
