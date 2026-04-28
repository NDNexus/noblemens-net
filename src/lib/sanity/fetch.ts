import { sanityClient } from './client'

/**
 * Fetch data from Sanity CMS using a GROQ query.
 *
 * ------------------------------------------------------------
 * ✅ PURPOSE
 * Centralized wrapper around Sanity client fetch.
 * Ensures consistent error handling, logging, and typing.
 *
 * ------------------------------------------------------------
 * ✅ GENERICS (Type Safety)
 * Use <T> to define expected return type.
 *
 * Example:
 *   const products = await fetchSanity<Product[]>(query)
 *
 * ------------------------------------------------------------
 * ✅ PARAMETERS
 * @param query   GROQ query string
 * @param params  Optional query parameters (for dynamic queries)
 *
 * Example:
 *   *[_type == "product" && slug.current == $slug][0]
 *
 *   params: { slug: "apple-cider-vinegar" }
 *
 * ------------------------------------------------------------
 * ✅ RETURNS
 * Promise<T> → strongly typed data from Sanity
 *
 * ------------------------------------------------------------
 * ✅ ENVIRONMENT BEHAVIOR
 * - Development:
 *    Logs query, params, and result for debugging
 *
 * - Production:
 *    Silent success (no logs)
 *    Only errors are logged
 *
 * ------------------------------------------------------------
 * ✅ ERROR HANDLING
 * - Logs full error context (query + params)
 * - Throws safe, generic error for UI layer
 * - Prevents leaking internal details to users
 *
 * ------------------------------------------------------------
 * ⚠️ BEST PRACTICES
 * - Keep queries in separate `queries.ts`
 * - Always type your responses (use interfaces)
 * - Avoid inline queries in UI components
 *
 * ------------------------------------------------------------
 * 🔐 SECURITY NOTE
 * This function uses a public Sanity client (no token).
 * Safe for frontend usage.
 *
 * DO NOT use authenticated clients here.
 * (Those belong in server-side code only)
 */

export async function fetchSanity<T>(
  query: string,
  params?: Record<string, unknown>
): Promise<T> {
  try {
    const data = (await sanityClient.fetch(query, params)) as T

    // DEV-ONLY: Debug logging
    if (import.meta.env.DEV) {
      console.log('🟢 Sanity Fetch Success:', {
        query,
        params,
        data,
      })
    }

    return data
  } catch (error) {
    // Always log full context for debugging
    console.error('🔴 Sanity Fetch Error:', {
      query,
      params,
      error,
    })

    // Throw safe error (UI should not see internal details)
    throw new Error('Failed to fetch data from CMS')
  }
}