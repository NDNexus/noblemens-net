import "dotenv/config"

import { createClient } from "@sanity/client"

/**
 * =========================================================
 * BUILD SANITY CLIENT
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Dedicated Sanity client for:
 * - Node.js build scripts
 * - Static generation
 * - SEO generation
 * - Schema generation
 * - Future sitemap generation
 *
 * IMPORTANT
 * ---------------------------------------------------------
 * This client MUST NEVER be imported into:
 * - frontend runtime
 * - browser bundles
 * - UI scripts
 *
 * WHY THIS EXISTS
 * ---------------------------------------------------------
 * Frontend runtime uses:
 *   import.meta.env
 *
 * Node build scripts use:
 *   process.env
 *
 * Mixing both environments in one shared client can
 * cause:
 * - browser crashes
 * - dotenv leakage
 * - process undefined errors
 *
 * =========================================================
 */

/**
 * =========================================================
 * ENV VARIABLES
 * =========================================================
 */

const projectId =
    process.env.VITE_SANITY_PROJECT_ID

const dataset =
    process.env.VITE_SANITY_DATASET

const apiVersion =
    process.env.VITE_SANITY_API_VERSION

/**
 * =========================================================
 * VALIDATION
 * =========================================================
 */

if (!projectId) {
    throw new Error(
        "Missing VITE_SANITY_PROJECT_ID"
    )
}

if (!dataset) {
    throw new Error(
        "Missing VITE_SANITY_DATASET"
    )
}

if (!apiVersion) {
    throw new Error(
        "Missing VITE_SANITY_API_VERSION"
    )
}

/**
 * =========================================================
 * BUILD SANITY CLIENT
 * =========================================================
 */

export const buildSanityClient =
    createClient({

        projectId,

        dataset,

        apiVersion,

        /**
         * Cached published content
         */

        useCdn: true,

        /**
         * Published-only content
         */

        perspective: "published"
    })