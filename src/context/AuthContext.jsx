import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

// Create context
const AuthContext = createContext(null);

// ⚠️ BYPASS DE AUTENTICACIÓN
// - Cambiar a 'true' SOLO para desarrollo de UI (sin acceso a base de datos)
// - Mantener en 'false' cuando necesites probar funcionalidades con Supabase
// 
// NOTA: Si BYPASS_AUTH está en true, el user.id será un UUID ficticio que 
// causará errores en las consultas a Supabase porque las tablas esperan 
// un UUID real existente en auth.users
const BYPASS_AUTH = false;

// Usuario mock para desarrollo (cuando bypass está activo)
// ⚠️ IMPORTANTE: Este UUID debe existir en la tabla user_profiles de Supabase
// o se creará automáticamente al primer uso
const DEV_USER_UUID = '00000000-0000-0000-0000-000000000001';

const MOCK_USER = {
    id: DEV_USER_UUID,
    email: 'dev@synapse.local',
    user_metadata: {
        display_name: 'Developer',
        university: 'Universidad de Desarrollo',
        career_year: 3
    }
};

/**
 * Auth Provider Component
 * Handles user authentication state and provides auth functions
 * 
 * ⚠️ BYPASS TEMPORAL: Autenticación desactivada para desarrollo
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(BYPASS_AUTH ? MOCK_USER : null);
    const [session, setSession] = useState(BYPASS_AUTH ? { user: MOCK_USER } : null);
    const [loading, setLoading] = useState(BYPASS_AUTH ? false : true);
    const [error, setError] = useState(null);

    // Initialize auth state
    useEffect(() => {
        // Si bypass está activo, no inicializar autenticación real
        if (BYPASS_AUTH) {
            console.log('🔓 Auth bypass activo - usando usuario mock');
            return;
        }

        let mounted = true;
        let timeoutId = null;

        // Timeout de seguridad - si tarda más de 5 segundos, asumimos que no hay sesión
        timeoutId = setTimeout(() => {
            if (mounted && loading) {
                console.warn('Auth initialization timeout - assuming no session');
                setLoading(false);
            }
        }, 5000);

        // Get initial session
        const initializeAuth = async () => {
            try {
                const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('Error getting session:', sessionError);
                    setError(sessionError.message);
                } else if (mounted) {
                    setSession(currentSession);
                    setUser(currentSession?.user ?? null);
                }
            } catch (err) {
                console.error('Error getting session:', err);
                if (mounted) {
                    setError(err.message);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                    clearTimeout(timeoutId);
                }
            }
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
                console.log('Auth event:', event);

                // Limpiar timeout al recibir cualquier evento de auth
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }

                if (mounted) {
                    setSession(newSession);
                    setUser(newSession?.user ?? null);
                    setLoading(false);
                }

                // Create profile on signup
                if (event === 'SIGNED_IN' && newSession?.user) {
                    await ensureUserProfile(newSession.user);
                }

                // Handle password recovery event — redirect to reset page
                if (event === 'PASSWORD_RECOVERY') {
                    window.location.href = '/reset-password';
                }
            }
        );

        // Cleanup subscription
        return () => {
            mounted = false;
            clearTimeout(timeoutId);
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
     * Reset password - send recovery email
     */
    const resetPassword = async (email) => {
        setLoading(true);
        setError(null);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });

            if (resetError) throw resetError;

            return { error: null };
        } catch (err) {
            setError(err.message);
            return { error: err };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Update password - after reset
     */
    const updatePassword = async (newPassword) => {
        setLoading(true);
        setError(null);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (updateError) throw updateError;

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
        clearError: () => setError(null),
        signUp,
        signIn,
        signOut,
        updateProfile,
        resetPassword,
        updatePassword
    };

    // Show loading state while initializing auth
    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <span style={{ fontSize: '3rem', animation: 'pulse 1.5s ease-in-out infinite' }}>🧠</span>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1rem' }}>Iniciando SYNAPSE...</p>
                <style>{`
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.1); opacity: 0.7; }
                    }
                `}</style>
            </div>
        );
    }

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
