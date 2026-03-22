/**
 * ==========================================================
 * SEO CONFIGURATION (MASTER CONTROL • PRODUCTION SYSTEM)
 * ==========================================================
 *
 * This file is your complete SEO control system.
 *
 * ARCHITECTURE (PRIORITY ORDER):
 * --------------------------------
 * 1. overrides      → page-level manual control (highest priority)
 * 2. categoryMeta   → category-level SEO (titles, descriptions, images)
 * 3. categorySEO    → keyword + positioning (used for inheritance)
 * 4. seoTemplates   → automatic fallback system
 * 5. site           → global defaults
 *
 * GOAL:
 * -----
 * ✔ Fully automated SEO
 * ✔ Full flexibility when needed
 * ✔ Clean separation of concerns
 * ✔ Infinite scalability
 *
 * ==========================================================
 */



/**
 * ==========================================================
 * SITE CONFIG TYPE
 * ==========================================================
 */
export interface SiteConfig {
  name: string
  tagline: string
  url: string
  defaultTitle: string
  defaultDescription: string
  defaultImage: string
  twitterHandle?: string
  keywords?: string[]
}


/**
 * ==========================================================
 * PAGE OVERRIDE TYPE (HIGHEST PRIORITY)
 * ==========================================================
 *
 * Use ONLY when needed.
 * Avoid overuse — let system handle most pages.
 */
export interface PageOverride {
  title?: string
  description?: string
  image?: string
  canonical?: string

  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: "website" | "article" | "product"

  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string

  noIndex?: boolean
  keywords?: string[]
}

export type Overrides = Record<string, PageOverride>


/**
 * ==========================================================
 * GLOBAL SITE SETTINGS
 * ==========================================================
 */
export const site: SiteConfig = {
  name: "Noblemens",
  tagline: "Pure Natural Products",
  url: "https://noblemens.net",

  defaultTitle: "Noblemens | Pure Natural Products",

  defaultDescription:
    "Pure natural products. Noblemens stands for honesty, quality, and trust.",

  defaultImage: "/images/og-default.jpg",

  twitterHandle: "@noblemens",

  keywords: [
    "natural vinegar",
    "apple cider vinegar",
    "attar perfume",
    "natural products India"
  ]
}


/**
 * ==========================================================
 * GLOBAL SEO TEMPLATES (AUTOMATION LAYER)
 * ==========================================================
 *
 * Used when no categoryMeta or override exists.
 *
 * VARIABLES:
 * ----------
 * %site%
 * %name%
 * %name_lower%
 * %collection%
 * %category%
 * %category_lower%
 */

import type { PageType } from "@utils/page-utils"

type SEOTemplate = {
  title?: string
  description?: string
}

export const seoTemplates: Partial<Record<PageType, SEOTemplate>> = {
  archive: {
    title: "%category% | %collection% | %site%",
    description:
      "Explore %category_lower% made using traditional methods..."
  },
  product: {
    title: "%name% | Buy %name% | %site%",
    description:
      "Buy %name_lower% made using traditional methods..."
  },
  post: {
    title: "%name% | Guide & Benefits | %site%",
    description:
      "Learn about %name_lower%..."
  },
  page: {
    title: "%name% | %site%",
    description:
      "%site% offers high-quality natural products."
  },
  landing: {
    title: "%name% | Premium Natural Products | %site%",
    description:
      "Discover %name_lower% from Noblemens. Crafted with purity, tradition, and uncompromising quality."
  }
}

/**
 * ==========================================================
 * CATEGORY META (🔥 CATEGORY-LEVEL SEO CONTROL)
 * ==========================================================
 *
 * This defines:
 * ✔ category titles
 * ✔ descriptions
 * ✔ OG images
 *
 * Keeps overrides clean.
 */
export const categoryMeta: Record<string, {
  title?: string
  description?: string
  image?: string
}> = {

  vinegars: {
    title: "Natural Vinegars | Pure & Unfiltered | Noblemens",
    description:
      "Explore our range of natural vinegars including apple cider, jamun, and dates vinegar. Traditionally fermented with the mother intact.",
    image: "/images/og-vinegars.jpg"
  },

  perfumes: {
    title: "Attar Perfumes | Alcohol-Free Natural Fragrance | Noblemens",
    description:
      "Discover premium attar perfumes crafted using traditional methods. Long-lasting, alcohol-free, and naturally derived.",
    image: "/images/og-perfumes.jpg"
  }

}


/**
 * ==========================================================
 * CATEGORY SEO (🔥 INHERITANCE LAYER)
 * ==========================================================
 *
 * Used for:
 * ✔ product-level SEO inheritance
 * ✔ keyword consistency
 */
export const categorySEO: Record<string, {
  keyword: string
  modifier: string
}> = {

  vinegars: {
    keyword: "Natural Vinegar",
    modifier: "Pure & Unfiltered"
  },

  perfumes: {
    keyword: "Attar Perfumes",
    modifier: "Alcohol-Free Natural Fragrance"
  }
}


/**
 * ==========================================================
 * PAGE-SPECIFIC OVERRIDES (HIGHEST PRIORITY CONTROL)
 * ==========================================================
 *
 * PURPOSE:
 * --------
 * This object allows FULL manual control over SEO for any page.
 *
 * It OVERRIDES everything else:
 * → categoryMeta
 * → categorySEO
 * → seoTemplates
 * → site defaults
 *
 * Use this ONLY when necessary.
 *
 * ==========================================================
 * WHEN TO USE OVERRIDES
 * ==========================================================
 *
 * ✔ High-conversion pages (important products)
 * ✔ SEO-targeted landing pages
 * ✔ Pages with specific keyword targeting
 * ✔ Pages needing custom social previews
 * ✔ Pages requiring noindex / special control
 *
 * ❌ DO NOT use for:
 * - normal pages
 * - categories (use categoryMeta instead)
 * - bulk content (use templates)
 *
 * ==========================================================
 * KEY STRUCTURE
 * ==========================================================
 *
 * Key = page.slug
 *
 * Examples:
 *
 * "apple-cider-vinegar"  → /products/.../apple-cider-vinegar
 * "vinegars"             → /products/vinegars
 * "about-us"             → /about-us
 *
 * ==========================================================
 * AVAILABLE FIELDS
 * ==========================================================
 *
 * CORE SEO:
 * ----------
 * title        → <title>
 * description  → meta description
 * canonical    → override canonical URL
 *
 * IMAGES:
 * ----------
 * image        → fallback image (used for OG + Twitter)
 *
 * OPEN GRAPH (Facebook, WhatsApp, LinkedIn):
 * ----------
 * ogTitle
 * ogDescription
 * ogImage
 * ogType       → "website" | "article" | "product"
 *
 * TWITTER:
 * ----------
 * twitterTitle
 * twitterDescription
 * twitterImage
 *
 * ADVANCED:
 * ----------
 * noIndex      → true = adds noindex meta tag
 * keywords     → custom keyword list
 *
 * ==========================================================
 * PRIORITY BEHAVIOR
 * ==========================================================
 *
 * Example:
 *
 * overrides["apple-cider-vinegar"] = {
 *   title: "Best Apple Cider Vinegar in India | Noblemens"
 * }
 *
 * Result:
 * → This title COMPLETELY overrides template + category logic
 *
 * ==========================================================
 * BEST PRACTICES
 * ==========================================================
 *
 * ✔ Keep overrides minimal (5–10 important pages)
 * ✔ Let templates handle most pages
 * ✔ Use categoryMeta for categories
 * ✔ Use overrides for business-critical pages only
 *
 * ==========================================================
 */
export const overrides: Overrides = {

}