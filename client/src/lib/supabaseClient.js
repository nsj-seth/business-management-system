import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Check that client/.env exists and is filled in.'
  );
}

// This client uses the anon (public) key. It is safe to expose in
// the browser -- real protection comes from Row Level Security
// policies on the database side, not from hiding this key.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);