/**
 * @file lib/client.ts
 * @description  ('use client')  Supabase
 */

import { createBrowserClient } from '@supabase/ssr'

/**
 *  Supabase
 * * @returns {SupabaseClient} Supabase
 * * @example
 * // :
 * import { createClient } from '@/lib/supabase/client'
 * * const supabase = createClient()
 * //  supabase.from(...)
 */
export function createClient() {
  //  async/await
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
