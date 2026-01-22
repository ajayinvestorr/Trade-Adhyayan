import { createClient } from '@supabase/supabase-js';

// The URL provided in your project files
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''; 

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);
export const supabase = createClient(supabaseUrl, supabaseKey);
