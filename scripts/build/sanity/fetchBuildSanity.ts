import { buildSanityClient }
    from "@scripts/build/sanity/buildClient"

/**
 * =========================================================
 * FETCH BUILD SANITY
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Dedicated Sanity fetch wrapper for:
 * - Static generation
 * - Product generation
 * - SEO generation
 * - Schema generation
 * - Build pipelines
 *
 * IMPORTANT
 * ---------------------------------------------------------
 * This utility is STRICTLY for:
 * - Node.js build environment
 *
 * MUST NEVER be imported into:
 * - frontend runtime
 * - browser bundles
 * - client-side rendering code
 *
 * =========================================================
 */

/**
 * =========================================================
 * FETCH BUILD SANITY
 * =========================================================
 *
 * @template T
 * Expected response type
 *
 * @param query
 * GROQ query string
 *
 * @param params
 * Optional GROQ params
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
 *   await fetchBuildSanity<Product[]>(query)
 *
 * const product =
 *   await fetchBuildSanity<Product>(
 *     query,
 *     { slug: "apple-cider-vinegar" }
 *   )
 *
 * =========================================================
 */

export async function fetchBuildSanity<T>(
    query: string,
    params?: Record<string, unknown>
): Promise<T> {

    /**
     * -----------------------------------------------------
     * ENVIRONMENT
     * -----------------------------------------------------
     */

    const isDev =
        process.env.NODE_ENV !== "production"

    try {

        /**
         * -------------------------------------------------
         * EXECUTE QUERY
         * -------------------------------------------------
         */

        const data =
            (
                await buildSanityClient.fetch(
                    query,
                    params
                )
            ) as T

        /**
         * -------------------------------------------------
         * DEV LOGGING
         * -------------------------------------------------
         */

        if (isDev) {

            console.log(
                "🟢 Build Sanity Fetch Success:",
                {
                    query,
                    params,
                    data
                }
            )
        }

        /**
         * -------------------------------------------------
         * RETURN DATA
         * -------------------------------------------------
         */

        return data

    } catch (error) {

        /**
         * -------------------------------------------------
         * ERROR LOGGING
         * -------------------------------------------------
         */

        console.error(
            "🔴 Build Sanity Fetch Error:",
            {
                query,
                params,
                error
            }
        )

        /**
         * -------------------------------------------------
         * SAFE ERROR
         * -------------------------------------------------
         */

        throw new Error(
            "Failed to fetch build data from Sanity"
        )
    }
}