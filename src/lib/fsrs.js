/**
 * FSRS (Free Spaced Repetition Scheduler) Algorithm v4.5
 * 
 * Based on the FSRS algorithm by Jarrett Ye
 * https://github.com/open-spaced-repetition/fsrs4anki
 * 
 * This is a modern replacement for SM-2 used in Anki
 */

// ============================================
// FSRS Parameters (optimized for medical content)
// ============================================
export const DEFAULT_FSRS_PARAMS = {
    // Model weights (w0-w16)
    w: [
        0.4,    // w0: initial stability for AGAIN
        0.6,    // w1: initial stability for HARD  
        2.4,    // w2: initial stability for GOOD
        5.8,    // w3: initial stability for EASY
        4.93,   // w4: difficulty mean reversion
        0.94,   // w5: stability decay
        0.86,   // w6: stability increase
        0.01,   // w7: minimum difficulty
        1.49,   // w8: stability growth base
        0.14,   // w9: stability growth difficulty factor
        0.94,   // w10: stability growth stability factor
        2.18,   // w11: failure stability base
        0.05,   // w12: failure stability difficulty factor
        0.34,   // w13: failure stability retrievability factor
        1.26,   // w14: hard penalty
        0.29,   // w15: easy bonus
        2.61    // w16: hard interval factor
    ],
    requestRetention: 0.9,  // Target retention rate (90%)
    maximumInterval: 365,   // Maximum interval in days
    // Decay and factor for interval calculation
    decay: -0.5,
    factor: 19 / 81  // ~0.2346
};

// ============================================
// Card States
// ============================================
export const CardState = {
    NEW: 'NEW',
    LEARNING: 'LEARNING',
    REVIEW: 'REVIEW',
    RELEARNING: 'RELEARNING'
};

// ============================================
// Rating Values
// ============================================
export const Rating = {
    AGAIN: 1,
    HARD: 2,
    GOOD: 3,
    EASY: 4
};

export const RatingLabels = {
    [Rating.AGAIN]: 'Again',
    [Rating.HARD]: 'Hard',
    [Rating.GOOD]: 'Good',
    [Rating.EASY]: 'Easy'
};

// ============================================
// Priority Multipliers for Medical Content
// ============================================
export const PriorityMultiplier = {
    CRITICAL: 2.0,  // Emergency doses, life-threatening conditions
    HIGH: 1.5,      // Key diagnoses, important medications
    NORMAL: 1.0,    // Standard content
    LOW: 0.5        // Historical facts, trivia
};

// ============================================
// Core FSRS Functions
// ============================================

/**
 * Calculate retrievability (probability of recall)
 * @param {number} stability - Current stability in days
 * @param {number} elapsedDays - Days since last review
 * @param {Object} params - FSRS parameters
 * @returns {number} Retrievability between 0 and 1
 */
export function calculateRetrievability(stability, elapsedDays, params = DEFAULT_FSRS_PARAMS) {
    if (stability <= 0) return 1;
    return Math.pow(1 + params.factor * elapsedDays / stability, params.decay);
}

/**
 * Calculate initial difficulty for a new card based on first rating
 * @param {number} rating - First rating (1-4)
 * @param {Object} params - FSRS parameters
 * @returns {number} Initial difficulty (0-10)
 */
export function calculateInitialDifficulty(rating, params = DEFAULT_FSRS_PARAMS) {
    const w = params.w;
    // D0(G) = w4 - (G - 3) * w5
    return clamp(w[4] - (rating - 3) * w[5], 1, 10);
}

/**
 * Calculate new difficulty after a review
 * @param {number} currentDifficulty - Current difficulty (0-10)
 * @param {number} rating - Review rating (1-4)
 * @param {Object} params - FSRS parameters
 * @returns {number} New difficulty (0-10)
 */
export function calculateNextDifficulty(currentDifficulty, rating, params = DEFAULT_FSRS_PARAMS) {
    const w = params.w;

    // Mean reversion: D'(D,G) = w6 * D0(3) + (1 - w6) * (D - w5 * (G - 3))
    const meanReversionD = w[4]; // D0(3) is just w4
    const newD = w[6] * meanReversionD + (1 - w[6]) * (currentDifficulty - w[5] * (rating - 3));

    return clamp(newD, 1, 10);
}

/**
 * Calculate initial stability for a new card
 * @param {number} rating - First rating (1-4)
 * @param {Object} params - FSRS parameters
 * @returns {number} Initial stability in days
 */
export function calculateInitialStability(rating, params = DEFAULT_FSRS_PARAMS) {
    const w = params.w;
    // S0(G) = w[G-1]
    return Math.max(w[rating - 1], 0.1);
}

/**
 * Calculate new stability after successful recall
 * @param {number} currentStability - Current stability in days
 * @param {number} difficulty - Current difficulty
 * @param {number} retrievability - Calculated retrievability at time of review
 * @param {number} rating - Review rating (2-4, successful recall)
 * @param {Object} params - FSRS parameters
 * @returns {number} New stability in days
 */
export function calculateRecallStability(
    currentStability,
    difficulty,
    retrievability,
    rating,
    params = DEFAULT_FSRS_PARAMS
) {
    const w = params.w;

    // S'_r(D,S,R,G) = S * (e^(w8) * (11 - D) * S^(-w9) * (e^(w10 * (1 - R)) - 1) * hardPenalty * easyBonus + 1)

    let hardPenalty = 1;
    let easyBonus = 1;

    if (rating === Rating.HARD) {
        hardPenalty = w[14];
    } else if (rating === Rating.EASY) {
        easyBonus = w[15];
    }

    const stabilityGrowth =
        Math.exp(w[8]) *
        (11 - difficulty) *
        Math.pow(currentStability, -w[9]) *
        (Math.exp(w[10] * (1 - retrievability)) - 1) *
        hardPenalty *
        easyBonus;

    return currentStability * (stabilityGrowth + 1);
}

/**
 * Calculate new stability after forgetting (rating = AGAIN)
 * @param {number} currentStability - Current stability in days
 * @param {number} difficulty - Current difficulty
 * @param {number} retrievability - Calculated retrievability at time of review
 * @param {Object} params - FSRS parameters
 * @returns {number} New stability in days
 */
export function calculateForgetStability(
    currentStability,
    difficulty,
    retrievability,
    params = DEFAULT_FSRS_PARAMS
) {
    const w = params.w;

    // S'_f(D,S,R) = w11 * D^(-w12) * ((S + 1)^(w13) - 1) * e^(w14 * (1 - R))
    return Math.max(
        w[11] *
        Math.pow(difficulty, -w[12]) *
        (Math.pow(currentStability + 1, w[13]) - 1) *
        Math.exp(w[14] * (1 - retrievability)),
        0.1
    );
}

/**
 * Calculate the next interval in days based on stability and target retention
 * @param {number} stability - Current stability in days
 * @param {Object} params - FSRS parameters
 * @returns {number} Next interval in days
 */
export function calculateInterval(stability, params = DEFAULT_FSRS_PARAMS) {
    const { requestRetention, maximumInterval, decay, factor } = params;

    // I(S,R) = S / FACTOR * (R^(1/DECAY) - 1)
    const interval = (stability / factor) * (Math.pow(requestRetention, 1 / decay) - 1);

    return Math.min(Math.max(Math.round(interval), 1), maximumInterval);
}

// ============================================
// Main FSRS Scheduler Function
// ============================================

/**
 * Schedule a card based on the review rating
 * @param {Object} card - Card object with FSRS state
 * @param {number} rating - Review rating (1-4)
 * @param {Object} params - FSRS parameters
 * @returns {Object} Updated card state
 */
export function scheduleCard(card, rating, params = DEFAULT_FSRS_PARAMS) {
    const now = new Date();
    const lastReview = card.last_review ? new Date(card.last_review) : now;
    const elapsedDays = Math.max(
        (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24),
        0
    );

    let newState = card.state;
    let newDifficulty = card.difficulty || 0;
    let newStability = card.stability || 0;
    let scheduledDays = 0;

    // Calculate current retrievability
    const retrievability = card.state === CardState.NEW
        ? 1
        : calculateRetrievability(card.stability, elapsedDays, params);

    // Handle based on current state
    if (card.state === CardState.NEW) {
        // First review of a new card
        newDifficulty = calculateInitialDifficulty(rating, params);
        newStability = calculateInitialStability(rating, params);

        if (rating === Rating.AGAIN) {
            newState = CardState.LEARNING;
            scheduledDays = 0; // Review again soon (minutes)
        } else {
            newState = CardState.REVIEW;
            scheduledDays = calculateInterval(newStability, params);
        }
    } else {
        // Subsequent reviews
        newDifficulty = calculateNextDifficulty(card.difficulty, rating, params);

        if (rating === Rating.AGAIN) {
            // Card forgotten
            newStability = calculateForgetStability(
                card.stability,
                card.difficulty,
                retrievability,
                params
            );
            newState = CardState.RELEARNING;
            scheduledDays = 0; // Review again soon (minutes)
        } else {
            // Card recalled successfully
            newStability = calculateRecallStability(
                card.stability,
                card.difficulty,
                retrievability,
                rating,
                params
            );
            newState = CardState.REVIEW;
            scheduledDays = calculateInterval(newStability, params);
        }
    }

    // Calculate next due date
    const dueDate = new Date(now);
    if (scheduledDays === 0) {
        // For learning/relearning, add minutes instead of days
        const minutes = rating === Rating.AGAIN ? 1 : 10;
        dueDate.setMinutes(dueDate.getMinutes() + minutes);
    } else {
        dueDate.setDate(dueDate.getDate() + scheduledDays);
    }

    return {
        ...card,
        state: newState,
        difficulty: newDifficulty,
        stability: newStability,
        retrievability: calculateRetrievability(newStability, 0, params),
        due_date: dueDate.toISOString(),
        last_review: now.toISOString(),
        scheduled_days: scheduledDays,
        elapsed_days: Math.round(elapsedDays),
        reps: (card.reps || 0) + 1,
        lapses: rating === Rating.AGAIN ? (card.lapses || 0) + 1 : (card.lapses || 0)
    };
}

/**
 * Get all possible intervals for each rating (for displaying on buttons)
 * @param {Object} card - Card object with FSRS state
 * @param {Object} params - FSRS parameters
 * @returns {Object} Intervals for each rating
 */
export function getSchedulingOptions(card, params = DEFAULT_FSRS_PARAMS) {
    const options = {};

    for (const [key, rating] of Object.entries(Rating)) {
        const scheduledCard = scheduleCard({ ...card }, rating, params);
        const interval = scheduledCard.scheduled_days;

        options[key] = {
            rating,
            interval,
            label: formatInterval(interval)
        };
    }

    return options;
}

/**
 * Format interval for display
 * @param {number} days - Interval in days
 * @returns {string} Formatted interval string
 */
export function formatInterval(days) {
    if (days === 0) {
        return '< 1m';
    } else if (days < 1) {
        const minutes = Math.round(days * 24 * 60);
        return `${minutes}m`;
    } else if (days === 1) {
        return '1d';
    } else if (days < 7) {
        return `${Math.round(days)}d`;
    } else if (days < 30) {
        const weeks = Math.round(days / 7);
        return `${weeks}w`;
    } else if (days < 365) {
        const months = Math.round(days / 30);
        return `${months}mo`;
    } else {
        const years = (days / 365).toFixed(1);
        return `${years}y`;
    }
}

// ============================================
// Priority-based Sorting
// ============================================

/**
 * Sort cards by priority and urgency for study session
 * @param {Array} cards - Array of cards
 * @param {Date} examDate - Optional exam date for cramming mode
 * @returns {Array} Sorted cards
 */
export function sortCardsByPriority(cards, examDate = null) {
    return [...cards].sort((a, b) => {
        // Calculate urgency score
        const scoreA = calculateUrgencyScore(a, examDate);
        const scoreB = calculateUrgencyScore(b, examDate);

        return scoreB - scoreA; // Higher score = more urgent
    });
}

/**
 * Calculate urgency score for a card
 * @param {Object} card - Card object
 * @param {Date} examDate - Optional exam date
 * @returns {number} Urgency score
 */
export function calculateUrgencyScore(card, examDate = null) {
    const now = new Date();
    const dueDate = new Date(card.due_date);

    // Base score: how overdue is the card?
    const daysOverdue = (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24);
    const baseScore = Math.max(daysOverdue, 0) + 1;

    // Priority multiplier
    const priorityMult = PriorityMultiplier[card.priority] || 1;

    // Retrievability factor (lower retrievability = more urgent)
    const retrievabilityFactor = card.retrievability < 0.9
        ? 2 - card.retrievability
        : 1;

    // Exam boost
    let examBoost = 1;
    if (examDate) {
        const daysToExam = (examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        if (daysToExam > 0 && daysToExam < 7) {
            examBoost = 3; // Triple priority if exam within a week
        } else if (daysToExam > 0 && daysToExam < 14) {
            examBoost = 2;
        }
    }

    return baseScore * priorityMult * retrievabilityFactor * examBoost;
}

// ============================================
// Utility Functions
// ============================================

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Check if a card is due for review
 * @param {Object} card - Card object
 * @returns {boolean} True if card is due
 */
export function isDue(card) {
    if (card.state === CardState.NEW) return true;

    const now = new Date();
    const dueDate = new Date(card.due_date);

    return now >= dueDate;
}

/**
 * Get cards that are due for review
 * @param {Array} cards - Array of cards
 * @returns {Array} Cards that are due
 */
export function getDueCards(cards) {
    return cards.filter(isDue);
}

/**
 * Get study statistics for a set of cards
 * @param {Array} cards - Array of cards
 * @returns {Object} Statistics
 */
export function getStudyStats(cards) {
    const newCards = cards.filter(c => c.state === CardState.NEW);
    const learningCards = cards.filter(c =>
        c.state === CardState.LEARNING || c.state === CardState.RELEARNING
    );
    const reviewCards = cards.filter(c => c.state === CardState.REVIEW && isDue(c));

    return {
        total: cards.length,
        new: newCards.length,
        learning: learningCards.length,
        review: reviewCards.length,
        due: getDueCards(cards).length
    };
}

export default {
    scheduleCard,
    getSchedulingOptions,
    formatInterval,
    sortCardsByPriority,
    isDue,
    getDueCards,
    getStudyStats,
    calculateRetrievability,
    Rating,
    RatingLabels,
    CardState,
    DEFAULT_FSRS_PARAMS
};
