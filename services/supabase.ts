import { createClient } from '@supabase/supabase-js';

// The URL provided in your project files
const supabaseUrl = 'https://qudffyqkqgnuiuggxyfl.supabase.co';
// Restoring your previous key
const supabaseKey = 'sb_publishable_74HiSjyOoysKwX_i-4Gm4Q_XNuGHrn1'; 

export const isSupabaseConfigured = true;
export const supabase = createClient(supabaseUrl, supabaseKey);
