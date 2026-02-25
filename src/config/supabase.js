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
    },

    // Document Storage helpers
    storage: {
        /**
         * Upload a file to Supabase Storage
         * @param {string} userId - User ID for folder path
         * @param {File} file - File to upload
         * @returns {Promise<{path: string, error: Error|null}>}
         */
        uploadDocument: async (userId, file) => {
            try {
                // Generate unique filename
                const timestamp = Date.now();
                const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                const filePath = `${userId}/${timestamp}_${sanitizedName}`;

                const { data, error } = await supabase.storage
                    .from('documents')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (error) throw error;

                return { path: data.path, error: null };
            } catch (error) {
                console.error('Upload error:', error);
                return { path: null, error };
            }
        },

        /**
         * Get a signed URL for downloading a document
         * @param {string} filePath - Path to the file in storage
         * @param {number} expiresIn - URL expiration in seconds (default 1 hour)
         * @returns {Promise<{url: string, error: Error|null}>}
         */
        getSignedUrl: async (filePath, expiresIn = 3600) => {
            try {
                const { data, error } = await supabase.storage
                    .from('documents')
                    .createSignedUrl(filePath, expiresIn);

                if (error) throw error;

                return { url: data.signedUrl, error: null };
            } catch (error) {
                console.error('Get URL error:', error);
                return { url: null, error };
            }
        },

        /**
         * Delete a document from storage
         * @param {string} filePath - Path to the file in storage
         * @returns {Promise<{error: Error|null}>}
         */
        deleteDocument: async (filePath) => {
            try {
                const { error } = await supabase.storage
                    .from('documents')
                    .remove([filePath]);

                if (error) throw error;

                return { error: null };
            } catch (error) {
                console.error('Delete error:', error);
                return { error };
            }
        },

        /**
         * Download a document file
         * @param {string} filePath - Path to the file in storage
         * @returns {Promise<{data: Blob, error: Error|null}>}
         */
        downloadDocument: async (filePath) => {
            try {
                const { data, error } = await supabase.storage
                    .from('documents')
                    .download(filePath);

                if (error) throw error;

                return { data, error: null };
            } catch (error) {
                console.error('Download error:', error);
                return { data: null, error };
            }
        }
    },

    // Documents database helpers
    documents: {
        /**
         * Get all documents for a user
         */
        getAll: async (userId) => {
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            return { data, error };
        },

        /**
         * Get a single document by ID
         */
        getById: async (id) => {
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .eq('id', id)
                .single();
            return { data, error };
        },

        /**
         * Create a new document record
         */
        create: async (document) => {
            const { data, error } = await supabase
                .from('documents')
                .insert(document)
                .select()
                .single();
            return { data, error };
        },

        /**
         * Update a document record
         */
        update: async (id, updates) => {
            const { data, error } = await supabase
                .from('documents')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();
            return { data, error };
        },

        /**
         * Delete a document record
         */
        delete: async (id) => {
            const { error } = await supabase
                .from('documents')
                .delete()
                .eq('id', id);
            return { error };
        },

        /**
         * Search documents by name or tags
         */
        search: async (userId, query) => {
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .eq('user_id', userId)
                .or(`name.ilike.%${query}%,subject.ilike.%${query}%`)
                .order('created_at', { ascending: false });
            return { data, error };
        }
    }
};

export default supabase;
