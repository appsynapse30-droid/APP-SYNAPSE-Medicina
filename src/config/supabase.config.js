// Supabase Configuration for SYNAPSE Medical Platform
// Reads from environment variables (Vite)

export const SUPABASE_CONFIG = {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://wxtnuxlzogcizssdjnio.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};

// Validate configuration
if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    console.warn('⚠️ Supabase credentials not found in environment variables');
}
