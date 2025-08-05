/**
 * @file lib/server.ts
 * @description  (Server Components, Route Handlers)  Supabase
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 *  Supabase
 * *  `cookies()`  cookie store
 * * @returns {Promise<SupabaseClient>}  Supabase  Promise
 * * @example
 * //  (e.g., /auth/callback/route.ts) :
 * import { createClient } from '@/lib/supabase/server'
 * * const supabase = await createClient()
 * const { data, error } = await supabase.auth.getUser()
 */
export async function createClient() {
  // cookies()  Promise await
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         *  cookie store  cookie
         * @param {string} name - cookie
         * @returns {string | undefined} cookie
         */
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        /**
         *  cookie store  cookie
         * @param {string} name - cookie
         * @param {string} value - cookie
         * @param {CookieOptions} options - cookie
         */
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            //  `set`
            //
          }
        },
        /**
         *  cookie store  cookie
         * @param {string} name - cookie
         * @param {CookieOptions} options - cookie
         */
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            //  `delete`
            //
          }
        },
      },
    }
  )
}
