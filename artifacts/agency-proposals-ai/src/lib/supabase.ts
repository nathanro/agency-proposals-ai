import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not set. ' +
    'Add them as Replit Secrets to enable authentication and data features.'
  );
}

// Use placeholder values so createClient doesn't throw at module load time.
// All actual Supabase calls will fail gracefully until real credentials are provided.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

// supabaseAdmin uses the service role key — only safe for server-side use.
// In this frontend-only app it falls back to the anon key.
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string) ||
    supabaseAnonKey ||
    'placeholder-anon-key'
);
