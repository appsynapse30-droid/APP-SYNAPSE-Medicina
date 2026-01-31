import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

// Create context
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * Handles user authentication state and provides auth functions
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize auth state
    useEffect(() => {
        // Get initial session
        const initializeAuth = async () => {
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                setSession(currentSession);
                setUser(currentSession?.user ?? null);
            } catch (err) {
                console.error('Error getting session:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
                console.log('Auth event:', event);
                setSession(newSession);
                setUser(newSession?.user ?? null);
                setLoading(false);

                // Create profile on signup
                if (event === 'SIGNED_IN' && newSession?.user) {
                    await ensureUserProfile(newSession.user);
                }
            }
        );

        // Cleanup subscription
        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    /**
     * Ensure user has a profile in the database
     */
    const ensureUserProfile = async (authUser) => {
        try {
            // Check if profile exists
            const { data: existingProfile } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('id', authUser.id)
                .single();

            if (!existingProfile) {
                // Create profile
                const { error: profileError } = await supabase
                    .from('user_profiles')
                    .insert({
                        id: authUser.id,
                        display_name: authUser.user_metadata?.display_name || authUser.email?.split('@')[0],
                        university: authUser.user_metadata?.university || null,
                        career_year: authUser.user_metadata?.career_year || null
                    });

                if (profileError) {
                    console.error('Error creating profile:', profileError);
                }

                // Create default settings
                const { error: settingsError } = await supabase
                    .from('user_settings')
                    .insert({
                        id: authUser.id
                    });

                if (settingsError) {
                    console.error('Error creating settings:', settingsError);
                }
            }
        } catch (err) {
            console.error('Error ensuring user profile:', err);
        }
    };

    /**
     * Sign up a new user
     */
    const signUp = async (email, password, metadata = {}) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata
                }
            });

            if (signUpError) throw signUpError;

            return { data, error: null };
        } catch (err) {
            setError(err.message);
            return { data: null, error: err };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Sign in an existing user
     */
    const signIn = async (email, password) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (signInError) throw signInError;

            return { data, error: null };
        } catch (err) {
            setError(err.message);
            return { data: null, error: err };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Sign out the current user
     */
    const signOut = async () => {
        setLoading(true);
        setError(null);

        try {
            const { error: signOutError } = await supabase.auth.signOut();
            if (signOutError) throw signOutError;

            setUser(null);
            setSession(null);
            return { error: null };
        } catch (err) {
            setError(err.message);
            return { error: err };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Update user profile
     */
    const updateProfile = async (updates) => {
        if (!user) return { error: new Error('No user logged in') };

        try {
            const { data, error: updateError } = await supabase
                .from('user_profiles')
                .update(updates)
                .eq('id', user.id)
                .select()
                .single();

            if (updateError) throw updateError;

            return { data, error: null };
        } catch (err) {
            return { data: null, error: err };
        }
    };

    const value = {
        user,
        session,
        loading,
        error,
        isAuthenticated: !!user,
        signUp,
        signIn,
        signOut,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook to use Auth context
 * @returns {Object} Auth state and functions
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
