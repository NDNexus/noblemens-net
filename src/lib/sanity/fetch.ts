import { sanityClient } from "./client"

/**
 * =========================================================
 * FRONTEND SANITY FETCH
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Frontend-only Sanity fetch utility.
 *
 * Used by:
 * - Product archive pages
 * - Category pages
 * - Search pages
 * - Runtime frontend rendering
 * - Dynamic UI interactions
 *
 * IMPORTANT
 * ---------------------------------------------------------
 * This utility is STRICTLY for:
 * - Browser runtime
 * - Vite frontend environment
 *
 * MUST NOT be used by:
 * - Node build scripts
 * - Static generation pipelines
 * - SEO generators
 * - Schema generators
 *
 * WHY
 * ---------------------------------------------------------
 * Frontend runtime depends on:
 * - import.meta.env
 * - browser-safe modules
 *
 * Build scripts use a SEPARATE fetch layer:
 * - fetchBuildSanity()
 *
 * This separation prevents:
 * - dotenv leakage into browser bundles
 * - process undefined errors
 * - Node/browser environment conflicts
 *
 * =========================================================
 */

/**
 * =========================================================
 * FETCH SANITY
 * =========================================================
 *
 * @template T
 * Expected response type
 *
 * @param query
 * GROQ query string
 *
 * @param params
 * Optional GROQ query params
 *
 * @returns
 * Promise<T>
 *
 * =========================================================
 *
 * EXAMPLE
 * ---------------------------------------------------------
 *
 * const products =
 *   await fetchSanity<Product[]>(query)
 *
 * const product =
 *   await fetchSanity<Product>(
 *     query,
 *     { slug: "apple-cider-vinegar" }
 *   )
 *
 * =========================================================
 */

export async function fetchSanity<T>(
  query: string,
  params?: Record<string, unknown>
): Promise<T> {

  /**
   * -------------------------------------------------------
   * VITE DEV DETECTION
   * -------------------------------------------------------
   */

  const isDev =
    import.meta.env.DEV

  try {

    /**
     * -----------------------------------------------------
     * EXECUTE QUERY
     * -----------------------------------------------------
     *
     * NOTE:
     * We intentionally cast AFTER fetch instead of
     * using fetch<T>() because Sanity overload
     * typings can become unstable in certain setups.
     */

    const data =
      (
        await sanityClient.fetch(
          query,
          params
        )
      ) as T

    /**
     * -----------------------------------------------------
     * DEV LOGGING
     * -----------------------------------------------------
     */

    if (isDev) {

      console.log(
        "🟢 Frontend Sanity Fetch Success:",
        {
          query,
          params,
          data
        }
      )
    }

    /**
     * -----------------------------------------------------
     * RETURN DATA
     * -----------------------------------------------------
     */

    return data

  } catch (error) {

    /**
     * -----------------------------------------------------
     * ERROR LOGGING
     * -----------------------------------------------------
     */

    console.error(
      "🔴 Frontend Sanity Fetch Error:",
      {
        query,
        params,
        error
      }
    )

    /**
     * -----------------------------------------------------
     * SAFE ERROR
     * -----------------------------------------------------
     */

    throw new Error(
      "Failed to fetch frontend data from CMS"
    )
  }
}