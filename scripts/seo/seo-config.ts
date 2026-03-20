/**
 * ==========================================================
 * SEO CONFIGURATION (MASTER CONTROL)
 * ==========================================================
 *
 * This file controls ALL SEO behavior of your website.
 *
 * Think of it as:
 * → "SEO CMS without a CMS"
 *
 * WHAT YOU CAN CONTROL HERE:
 * -------------------------
 * ✔ Page titles
 * ✔ Descriptions
 * ✔ Open Graph (WhatsApp, Facebook, LinkedIn)
 * ✔ Twitter cards
 * ✔ Canonical URLs
 * ✔ Indexing behavior (noindex)
 * ✔ Keywords (optional)
 *
 * STRUCTURE:
 * ----------
 * 1. site       → global defaults (used everywhere)
 * 2. overrides  → per-page customization (optional)
 *
 * ==========================================================
 */


/**
 * ==========================================================
 * SITE CONFIG TYPE
 * ==========================================================
 *
 * Defines global SEO defaults.
 *
 * These are used when a page does NOT have overrides.
 */
export interface SiteConfig {

  /**
   * Brand name (used in titles)
   */
  name: string

  /**
   * Tagline (used for homepage)
   */
  tagline: string

  /**
   * Base URL (NO trailing slash)
   * Example: https://noblemens.net
   */
  url: string

  /**
   * Default title (fallback)
   */
  defaultTitle: string

  /**
   * Default description (fallback)
   */
  defaultDescription: string

  /**
   * Default OG image (must exist in /public)
   */
  defaultImage: string

  /**
   * Twitter handle (optional)
   */
  twitterHandle?: string

  /**
   * Optional global keywords
   */
  keywords?: string[]
}


/**
 * ==========================================================
 * PAGE OVERRIDE TYPE
 * ==========================================================
 *
 * You can override ANY of these per page.
 *
 * IMPORTANT:
 * ----------
 * Only override what you NEED.
 * Everything else falls back automatically.
 */
export interface PageOverride {

  /**
   * ----------------------------------------------------------
   * CORE SEO (MOST IMPORTANT)
   * ----------------------------------------------------------
   */

  /**
   * Page title (shown in Google + browser tab)
   */
  title?: string

  /**
   * Meta description (shown in search results)
   */
  description?: string

  /**
   * Main image for SEO + sharing
   */
  image?: string

  /**
   * Canonical URL (avoid duplicate content issues)
   * Example:
   * https://noblemens.net/vinegars
   */
  canonical?: string


  /**
   * ----------------------------------------------------------
   * OPEN GRAPH (SOCIAL SHARING)
   * ----------------------------------------------------------
   *
   * Used by:
   * WhatsApp, Facebook, LinkedIn, Telegram
   */

  ogTitle?: string
  ogDescription?: string
  ogImage?: string

  /**
   * Type of content
   */
  ogType?: "website" | "article" | "product"


  /**
   * ----------------------------------------------------------
   * TWITTER CARDS
   * ----------------------------------------------------------
   */

  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string


  /**
   * ----------------------------------------------------------
   * SEO CONTROL
   * ----------------------------------------------------------
   */

  /**
   * Prevent indexing (for private pages)
   */
  noIndex?: boolean

  /**
   * Page-specific keywords (optional, low priority in modern SEO)
   */
  keywords?: string[]
}


/**
 * Dictionary of overrides
 *
 * KEY = filename (without .html)
 *
 * Example:
 * /attars.html → "attars"
 */
export type Overrides = Record<string, PageOverride>



/**
 * ==========================================================
 * GLOBAL SITE SETTINGS
 * ==========================================================
 */

export const site: SiteConfig = {

  /**
   * Brand Identity
   */
  name: "Noblemens",
  tagline: "Pure Natural Products",

  /**
   * Base URL
   */
  url: "https://noblemens.net",

  /**
   * Default SEO
   */
  defaultTitle: "Noblemens | Pure Natural Products",

  defaultDescription:
    "Pure natural products. Noblemens stands for honesty, quality, and trust.",

  /**
   * Default Open Graph Image
   */
  defaultImage: "/images/og-default.jpg",

  /**
   * Social
   */
  twitterHandle: "@noblemens",

  /**
   * Keywords (optional)
   */
  keywords: [
    "natural vinegar",
    "apple cider vinegar",
    "attar perfume",
    "natural products India"
  ]
}



/**
 * ==========================================================
 * PAGE-SPECIFIC OVERRIDES (EXAMPLES)
 * ==========================================================
 *
 * USE THIS WHEN:
 * --------------
 * ✔ You want better SEO control
 * ✔ You want custom social previews
 * ✔ You want product-specific metadata
 *
 * DO NOT OVERUSE.
 * Most pages should rely on defaults.
 */

export const overrides: Overrides = {

  /**
   * ----------------------------------------------------------
   * CATEGORY PAGE EXAMPLE
   * ----------------------------------------------------------
   */
  vinegars: {

    title: "Pure Natural Vinegars | Noblemens",

    description:
      "Explore our range of natural vinegars including apple cider, jamun, and dates vinegar.",

    ogImage: "/images/og-vinegars.jpg"
  },


  /**
   * ----------------------------------------------------------
   * PRODUCT PAGE EXAMPLE
   * ----------------------------------------------------------
   */
  "black-jamun-vinegar": {

    title: "Black Jamun Vinegar | Noblemens",

    description:
      "Natural black jamun vinegar with mother. Traditionally crafted for purity and health.",

    image: "/images/products/jamun.jpg",

    ogType: "product"
  },


  /**
   * ----------------------------------------------------------
   * BLOG ARTICLE EXAMPLE
   * ----------------------------------------------------------
   */
  "natural-perfumes-for-men": {

    title: "Natural Perfumes for Men | Noblemens",

    description:
      "Discover why natural attars are the best alternative to synthetic perfumes.",

    ogType: "article"
  },


  /**
   * ----------------------------------------------------------
   * PRIVATE PAGE EXAMPLE
   * ----------------------------------------------------------
   */
  admin: {

    title: "Admin Panel",

    noIndex: true
  }

}