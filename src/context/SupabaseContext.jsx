import React, { createContext, useContext } from 'react';
import { supabase, supabaseHelpers } from '../config/supabase';

// Create context
const SupabaseContext = createContext(null);

/**
 * Supabase Provider Component
 * Provides the Supabase client and helpers to the entire app
 */
export function SupabaseProvider({ children }) {
    const value = {
        supabase,
        ...supabaseHelpers
    };

    return (
        <SupabaseContext.Provider value={value}>
            {children}
        </SupabaseContext.Provider>
    );
}

/**
 * Hook to use Supabase context
 * @returns {Object} Supabase client and helper functions
 */
export function useSupabase() {
    const context = useContext(SupabaseContext);
    if (!context) {
        throw new Error('useSupabase must be used within a SupabaseProvider');
    }
    return context;
}

export default SupabaseContext;
