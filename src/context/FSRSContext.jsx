import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../config/supabase';
import {
    scheduleCard,
    getSchedulingOptions,
    sortCardsByPriority,
    getDueCards,
    getStudyStats,
    DEFAULT_FSRS_PARAMS,
    Rating,
    CardState
} from '../lib/fsrs';

// Create context
const FSRSContext = createContext(null);

/**
 * FSRS Provider Component
 * Manages flashcard study sessions and FSRS scheduling
 */
export function FSRSProvider({ children }) {
    const { user } = useAuth();

    // Study session state
    const [studyQueue, setStudyQueue] = useState([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isStudying, setIsStudying] = useState(false);
    const [sessionStats, setSessionStats] = useState({
        studied: 0,
        correct: 0,
        incorrect: 0,
        startTime: null,
        sessionId: null
    });

    // FSRS parameters (can be customized per user)
    const [fsrsParams, setFsrsParams] = useState(DEFAULT_FSRS_PARAMS);

    // Loading states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Load user's FSRS settings from database
     */
    const loadUserSettings = useCallback(async () => {
        if (!user) return;

        try {
            const { data: settings } = await supabase
                .from('user_settings')
                .select('fsrs_request_retention, fsrs_maximum_interval')
                .eq('id', user.id)
                .single();

            if (settings) {
                setFsrsParams(prev => ({
                    ...prev,
                    requestRetention: settings.fsrs_request_retention || 0.9,
                    maximumInterval: settings.fsrs_maximum_interval || 365
                }));
            }
        } catch (err) {
            console.error('Error loading FSRS settings:', err);
        }
    }, [user]);

    /**
     * Start a study session
     * @param {string|null} deckId - Optional deck ID to study from
     * @param {Object} options - Study options
     */
    const startStudySession = useCallback(async (deckId = null, options = {}) => {
        if (!user) {
            setError('User not authenticated');
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            // Load user settings
            await loadUserSettings();

            // Build query for cards
            let query = supabase
                .from('flashcards')
                .select('*, flashcard_decks(name, color, icon)')
                .eq('user_id', user.id)
                .lte('due_date', new Date().toISOString());

            if (deckId) {
                query = query.eq('deck_id', deckId);
            }

            // Add new cards if requested
            if (options.includeNew) {
                const { data: newCards } = await supabase
                    .from('flashcards')
                    .select('*, flashcard_decks(name, color, icon)')
                    .eq('user_id', user.id)
                    .eq('state', CardState.NEW)
                    .limit(options.newCardsLimit || 20);

                const { data: dueCards } = await query.limit(options.reviewLimit || 100);

                // Combine and sort
                const allCards = [...(dueCards || []), ...(newCards || [])];
                const sortedCards = sortCardsByPriority(
                    allCards,
                    options.examDate ? new Date(options.examDate) : null
                );

                setStudyQueue(sortedCards);
            } else {
                const { data: cards, error: fetchError } = await query
                    .limit(options.limit || 100);

                if (fetchError) throw fetchError;

                const sortedCards = sortCardsByPriority(
                    cards || [],
                    options.examDate ? new Date(options.examDate) : null
                );

                setStudyQueue(sortedCards);
            }

            // Create study session record
            const { data: session, error: sessionError } = await supabase
                .from('study_sessions')
                .insert({
                    user_id: user.id,
                    deck_id: deckId,
                    started_at: new Date().toISOString(),
                    exam_mode: options.examMode || false,
                    session_type: options.sessionType || 'normal'
                })
                .select()
                .single();

            if (sessionError) throw sessionError;

            setSessionStats({
                studied: 0,
                correct: 0,
                incorrect: 0,
                startTime: new Date(),
                sessionId: session.id
            });

            setCurrentCardIndex(0);
            setIsStudying(true);

            return true;
        } catch (err) {
            console.error('Error starting study session:', err);
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [user, loadUserSettings]);

    /**
     * Get the current card being studied
     */
    const getCurrentCard = useCallback(() => {
        if (currentCardIndex >= studyQueue.length) return null;
        return studyQueue[currentCardIndex];
    }, [studyQueue, currentCardIndex]);

    /**
     * Get scheduling options for the current card
     */
    const getCurrentSchedulingOptions = useCallback(() => {
        const card = getCurrentCard();
        if (!card) return null;
        return getSchedulingOptions(card, fsrsParams);
    }, [getCurrentCard, fsrsParams]);

    /**
     * Answer the current card with a rating
     * @param {number} rating - Rating (1=Again, 2=Hard, 3=Good, 4=Easy)
     */
    const answerCard = useCallback(async (rating) => {
        const card = getCurrentCard();
        if (!card || !user) return null;

        setLoading(true);

        try {
            // Calculate new card state using FSRS
            const updatedCard = scheduleCard(card, rating, fsrsParams);

            // Update card in database
            const { error: updateError } = await supabase
                .from('flashcards')
                .update({
                    state: updatedCard.state,
                    difficulty: updatedCard.difficulty,
                    stability: updatedCard.stability,
                    retrievability: updatedCard.retrievability,
                    due_date: updatedCard.due_date,
                    last_review: updatedCard.last_review,
                    scheduled_days: updatedCard.scheduled_days,
                    elapsed_days: updatedCard.elapsed_days,
                    reps: updatedCard.reps,
                    lapses: updatedCard.lapses
                })
                .eq('id', card.id);

            if (updateError) throw updateError;

            // Log the review
            await supabase.from('review_logs').insert({
                card_id: card.id,
                user_id: user.id,
                rating: ['AGAIN', 'HARD', 'GOOD', 'EASY'][rating - 1],
                state_before: card.state,
                difficulty_before: card.difficulty,
                stability_before: card.stability,
                state_after: updatedCard.state,
                difficulty_after: updatedCard.difficulty,
                stability_after: updatedCard.stability,
                scheduled_days: updatedCard.scheduled_days
            });

            // Update session stats
            const isCorrect = rating >= Rating.GOOD;
            setSessionStats(prev => ({
                ...prev,
                studied: prev.studied + 1,
                correct: isCorrect ? prev.correct + 1 : prev.correct,
                incorrect: !isCorrect ? prev.incorrect + 1 : prev.incorrect
            }));

            // If card needs relearning, add it back to the queue
            if (rating === Rating.AGAIN) {
                setStudyQueue(prev => {
                    const newQueue = [...prev];
                    newQueue[currentCardIndex] = updatedCard;
                    // Move card to later in the queue (about 5-10 cards later)
                    const reinsertPosition = Math.min(
                        currentCardIndex + Math.floor(Math.random() * 5) + 5,
                        newQueue.length
                    );
                    const [removedCard] = newQueue.splice(currentCardIndex, 1);
                    newQueue.splice(reinsertPosition, 0, removedCard);
                    return newQueue;
                });
            } else {
                // Move to next card
                setCurrentCardIndex(prev => prev + 1);
            }

            return updatedCard;
        } catch (err) {
            console.error('Error answering card:', err);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [getCurrentCard, user, fsrsParams, currentCardIndex]);

    /**
     * End the current study session
     */
    const endStudySession = useCallback(async () => {
        if (!sessionStats.sessionId) return;

        try {
            const duration = sessionStats.startTime
                ? Math.round((new Date() - sessionStats.startTime) / 60000)
                : 0;

            await supabase
                .from('study_sessions')
                .update({
                    ended_at: new Date().toISOString(),
                    duration_minutes: duration,
                    cards_studied: sessionStats.studied,
                    cards_correct: sessionStats.correct,
                    cards_incorrect: sessionStats.incorrect,
                    new_cards_studied: studyQueue.filter(c => c.state === CardState.NEW).length
                })
                .eq('id', sessionStats.sessionId);

            setIsStudying(false);
            setStudyQueue([]);
            setCurrentCardIndex(0);
            setSessionStats({
                studied: 0,
                correct: 0,
                incorrect: 0,
                startTime: null,
                sessionId: null
            });
        } catch (err) {
            console.error('Error ending study session:', err);
        }
    }, [sessionStats, studyQueue]);

    /**
     * Skip the current card (move to end of queue)
     */
    const skipCard = useCallback(() => {
        if (currentCardIndex >= studyQueue.length) return;

        setStudyQueue(prev => {
            const newQueue = [...prev];
            const [skippedCard] = newQueue.splice(currentCardIndex, 1);
            newQueue.push(skippedCard);
            return newQueue;
        });
    }, [currentCardIndex, studyQueue.length]);

    /**
     * Get progress information for the current session
     */
    const getProgress = useCallback(() => {
        const total = studyQueue.length;
        const completed = sessionStats.studied;
        const remaining = Math.max(0, total - currentCardIndex);

        return {
            total,
            completed,
            remaining,
            currentIndex: currentCardIndex + 1,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
            accuracy: sessionStats.studied > 0
                ? Math.round((sessionStats.correct / sessionStats.studied) * 100)
                : 0
        };
    }, [studyQueue.length, sessionStats, currentCardIndex]);

    /**
     * Get due cards count for a deck
     */
    const getDueCardsCount = useCallback(async (deckId = null) => {
        if (!user) return { new: 0, due: 0, total: 0 };

        try {
            let query = supabase
                .from('flashcards')
                .select('id, state, due_date')
                .eq('user_id', user.id);

            if (deckId) {
                query = query.eq('deck_id', deckId);
            }

            const { data: cards } = await query;

            if (!cards) return { new: 0, due: 0, total: 0 };

            const stats = getStudyStats(cards);
            return stats;
        } catch (err) {
            console.error('Error getting due cards count:', err);
            return { new: 0, due: 0, total: 0 };
        }
    }, [user]);

    const value = {
        // State
        studyQueue,
        currentCardIndex,
        isStudying,
        sessionStats,
        loading,
        error,
        fsrsParams,

        // Functions
        startStudySession,
        endStudySession,
        getCurrentCard,
        getCurrentSchedulingOptions,
        answerCard,
        skipCard,
        getProgress,
        getDueCardsCount,

        // Constants
        Rating,
        CardState
    };

    return (
        <FSRSContext.Provider value={value}>
            {children}
        </FSRSContext.Provider>
    );
}

/**
 * Hook to use FSRS context
 */
export function useFSRS() {
    const context = useContext(FSRSContext);
    if (!context) {
        throw new Error('useFSRS must be used within an FSRSProvider');
    }
    return context;
}

export default FSRSContext;
