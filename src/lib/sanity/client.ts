import { createClient } from '@sanity/client'

/**
 * Sanity Client (Production Ready)
 * --------------------------------
 * Handles all content fetching from Sanity CMS
 * Used across the frontend application
 */

export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION,

  /**
   * useCdn:
   * - true  → fast, cached (for live website)
   * - false → fresh data (for preview / admin)
   */
  useCdn: true,

  /**
   * perspective:
   * - 'published' → only live content
   */
  perspective: 'published',
})