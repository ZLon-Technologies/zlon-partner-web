import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_ZLON_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_ZLON_SUPABASE_ANON_KEY!
  );
}
