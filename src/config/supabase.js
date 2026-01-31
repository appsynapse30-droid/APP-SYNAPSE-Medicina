// Supabase Client - SYNAPSE Medical Platform
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from './supabase.config';

// Create Supabase client
export const supabase = createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
);

// Helper functions for common operations
export const supabaseHelpers = {
    // Auth helpers
    auth: {
        signUp: async (email, password, metadata = {}) => {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: metadata }
            });
            return { data, error };
        },

        signIn: async (email, password) => {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            return { data, error };
        },

        signOut: async () => {
            const { error } = await supabase.auth.signOut();
            return { error };
        },

        getUser: async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            return { user, error };
        },

        getSession: async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            return { session, error };
        }
    },

    // Flashcard Decks helpers
    decks: {
        getAll: async (userId) => {
            const { data, error } = await supabase
                .from('flashcard_decks')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            return { data, error };
        },

        create: async (deck) => {
            const { data, error } = await supabase
                .from('flashcard_decks')
                .insert(deck)
                .select()
                .single();
            return { data, error };
        },

        update: async (id, updates) => {
            const { data, error } = await supabase
                .from('flashcard_decks')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            return { data, error };
        },

        delete: async (id) => {
            const { error } = await supabase
                .from('flashcard_decks')
                .delete()
                .eq('id', id);
            return { error };
        }
    },

    // Flashcards helpers
    cards: {
        getByDeck: async (deckId) => {
            const { data, error } = await supabase
                .from('flashcards')
                .select('*')
                .eq('deck_id', deckId)
                .order('created_at', { ascending: false });
            return { data, error };
        },

        getDueCards: async (userId, limit = 50) => {
            const { data, error } = await supabase
                .from('flashcards')
                .select('*, flashcard_decks(name, color, icon)')
                .eq('user_id', userId)
                .lte('due_date', new Date().toISOString())
                .order('priority', { ascending: false })
                .order('due_date', { ascending: true })
                .limit(limit);
            return { data, error };
        },

        getNewCards: async (userId, limit = 20) => {
            const { data, error } = await supabase
                .from('flashcards')
                .select('*, flashcard_decks(name, color, icon)')
                .eq('user_id', userId)
                .eq('state', 'NEW')
                .order('priority', { ascending: false })
                .limit(limit);
            return { data, error };
        },

        create: async (card) => {
            const { data, error } = await supabase
                .from('flashcards')
                .insert(card)
                .select()
                .single();
            return { data, error };
        },

        update: async (id, updates) => {
            const { data, error } = await supabase
                .from('flashcards')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            return { data, error };
        },

        delete: async (id) => {
            const { error } = await supabase
                .from('flashcards')
                .delete()
                .eq('id', id);
            return { error };
        }
    },

    // Review Logs helpers
    reviews: {
        log: async (reviewLog) => {
            const { data, error } = await supabase
                .from('review_logs')
                .insert(reviewLog)
                .select()
                .single();
            return { data, error };
        },

        getStats: async (userId, days = 7) => {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const { data, error } = await supabase
                .from('review_logs')
                .select('*')
                .eq('user_id', userId)
                .gte('reviewed_at', startDate.toISOString());
            return { data, error };
        }
    },

    // Study Sessions helpers
    sessions: {
        start: async (userId, deckId = null) => {
            const { data, error } = await supabase
                .from('study_sessions')
                .insert({
                    user_id: userId,
                    deck_id: deckId,
                    started_at: new Date().toISOString()
                })
                .select()
                .single();
            return { data, error };
        },

        end: async (sessionId, stats) => {
            const { data, error } = await supabase
                .from('study_sessions')
                .update({
                    ended_at: new Date().toISOString(),
                    ...stats
                })
                .eq('id', sessionId)
                .select()
                .single();
            return { data, error };
        },

        getRecent: async (userId, limit = 10) => {
            const { data, error } = await supabase
                .from('study_sessions')
                .select('*')
                .eq('user_id', userId)
                .order('started_at', { ascending: false })
                .limit(limit);
            return { data, error };
        }
    },

    // User Profile helpers
    profile: {
        get: async (userId) => {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single();
            return { data, error };
        },

        upsert: async (profile) => {
            const { data, error } = await supabase
                .from('user_profiles')
                .upsert(profile)
                .select()
                .single();
            return { data, error };
        }
    },

    // User Settings helpers
    settings: {
        get: async (userId) => {
            const { data, error } = await supabase
                .from('user_settings')
                .select('*')
                .eq('id', userId)
                .single();
            return { data, error };
        },

        upsert: async (settings) => {
            const { data, error } = await supabase
                .from('user_settings')
                .upsert(settings)
                .select()
                .single();
            return { data, error };
        }
    },

    // Exams helpers
    exams: {
        getUpcoming: async (userId) => {
            const { data, error } = await supabase
                .from('exams')
                .select('*')
                .eq('user_id', userId)
                .eq('is_completed', false)
                .gte('exam_date', new Date().toISOString().split('T')[0])
                .order('exam_date', { ascending: true });
            return { data, error };
        },

        create: async (exam) => {
            const { data, error } = await supabase
                .from('exams')
                .insert(exam)
                .select()
                .single();
            return { data, error };
        }
    }
};

export default supabase;
