/**
 * Adaptive Learning Engine
 * 
 * Implements algorithms for:
 * 1. Dynamic Difficulty Adjustment (DDA)
 * 2. Spaced Repetition (SM-2 Algorithm)
 * 3. Weakness Detection & Content Prioritization
 */

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'master';

export interface ReviewItem {
    id: string;
    topic: string;
    level: DifficultyLevel;
    lastReview: Date;
    nextReview: Date;
    interval: number; // Days since last review
    easeFactor: number; // SM-2 ease factor (default 2.5)
    reviewCount: number;
}

export interface QuizResult {
    score: number; // 0 to 1 (percentage)
    totalQuestions: number;
    difficulty: DifficultyLevel;
    timestamp: Date;
}

export class AdaptiveEngine {

    // ============================================
    // 1. Dynamic Difficulty Adjustment
    // ============================================

    /**
     * Calculates the next difficulty level based on recent performance.
     * 
     * Logic:
     * - Score > 85%: Increase difficulty
     * - Score < 60%: Decrease difficulty
     * - Otherwise: Maintain current difficulty
     */
    static adjustDifficulty(currentLevel: DifficultyLevel, recentScores: QuizResult[]): DifficultyLevel {
        if (recentScores.length === 0) return currentLevel;

        // Calculate weighted average of last 3 scores (most recent has higher weight)
        const recent = recentScores.slice(-3);
        const weightedSum = recent.reduce((sum, result, idx) => sum + (result.score * (idx + 1)), 0);
        const weightTotal = recent.reduce((sum, _, idx) => sum + (idx + 1), 0);
        const averageScore = weightedSum / weightTotal;

        const levels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'master'];
        const currentIndex = levels.indexOf(currentLevel);

        if (averageScore > 0.85 && currentIndex < levels.length - 1) {
            return levels[currentIndex + 1];
        } else if (averageScore < 0.60 && currentIndex > 0) {
            return levels[currentIndex - 1];
        }

        return currentLevel;
    }

    // ============================================
    // 2. Spaced Repetition (SM-2 Algorithm)
    // ============================================

    /**
     * Calculates the next review date using a modified SM-2 algorithm.
     * 
     * @param item - The item being reviewed
     * @param performanceRating - 0-5 scale (0=blackout, 5=perfect recall)
     */
    static scheduleNextReview(item: ReviewItem, performanceRating: number): ReviewItem {
        let { interval, easeFactor, reviewCount } = item;

        // Apply SM-2 logic
        if (performanceRating >= 3) {
            if (reviewCount === 0) {
                interval = 1;
            } else if (reviewCount === 1) {
                interval = 6;
            } else {
                interval = Math.round(interval * easeFactor);
            }
            reviewCount += 1;
        } else {
            interval = 1; // Reset interval on failure
            reviewCount = 0;
        }

        // Update Ease Factor
        easeFactor = easeFactor + (0.1 - (5 - performanceRating) * (0.08 + (5 - performanceRating) * 0.02));
        if (easeFactor < 1.3) easeFactor = 1.3; // Minimum EF

        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + interval);

        return {
            ...item,
            interval,
            easeFactor,
            reviewCount,
            lastReview: new Date(),
            nextReview
        };
    }

    // ============================================
    // 3. Weakness Detection
    // ============================================

    /**
     * Identifies weak topics based on aggregated quiz results.
     */
    static detectWeaknesses(history: { topic: string; score: number }[]): string[] {
        const topicPerformance: Record<string, { totalScore: number; count: number }> = {};

        // Aggregate scores by topic
        history.forEach(record => {
            if (!topicPerformance[record.topic]) {
                topicPerformance[record.topic] = { totalScore: 0, count: 0 };
            }
            topicPerformance[record.topic].totalScore += record.score;
            topicPerformance[record.topic].count += 1;
        });

        // Identify topics with average score < 70%
        const weaknesses: string[] = [];
        for (const [topic, data] of Object.entries(topicPerformance)) {
            const average = data.totalScore / data.count;
            if (average < 0.70) {
                weaknesses.push(topic);
            }
        }

        return weaknesses;
    }
}
