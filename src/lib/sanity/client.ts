import { createClient } from "@sanity/client"

/**
 * =========================================================
 * FRONTEND SANITY CLIENT
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Browser-safe Sanity client for frontend runtime.
 *
 * Used by:
 * - Product archive pages
 * - Category pages
 * - Search pages
 * - Frontend rendering
 * - Client-side interactions
 *
 * IMPORTANT
 * ---------------------------------------------------------
 * This client is STRICTLY for:
 * - Vite frontend runtime
 * - Browser environment
 *
 * MUST NOT be used by:
 * - Node build scripts
 * - Static generation
 * - SEO generation
 * - Schema generation
 *
 * Build scripts use:
 * scripts/build/sanity/buildClient.ts
 *
 * =========================================================
 */

/**
 * =========================================================
 * ENV VARIABLES
 * =========================================================
 */

const projectId =
  import.meta.env.VITE_SANITY_PROJECT_ID

const dataset =
  import.meta.env.VITE_SANITY_DATASET

const apiVersion =
  import.meta.env.VITE_SANITY_API_VERSION

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
 * FRONTEND SANITY CLIENT
 * =========================================================
 */

export const sanityClient =
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