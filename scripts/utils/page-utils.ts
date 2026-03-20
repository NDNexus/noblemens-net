import path from "path"

/**
 * ==========================================================
 * PAGE TYPES
 * ==========================================================
 *
 * page      → standalone pages (/, /about)
 * archive   → collection root (/products, /blog)
 * product   → product detail page
 * post      → blog article
 * landing   → marketing / landing pages
 */
export type PageType =
  | "page"
  | "archive"
  | "product"
  | "post"
  | "landing"

/**
 * ==========================================================
 * PAGE INFO STRUCTURE
 * ==========================================================
 *
 * Standardized metadata used across:
 * - SEO generator
 * - Schema generator
 * - Sitemap generation
 */
export interface PageInfo {
  filePath: string
  name: string
  slug: string            
  urlPath: string
  type: PageType
  collection?: string
}

/**
 * ==========================================================
 * COLLECTION → TYPE MAP
 * ==========================================================
 */
const COLLECTION_TYPE_MAP: Record<string, PageType> = {
  blog: "post",
  products: "product",
  landing: "landing",
}

/**
 * ==========================================================
 * GET PAGE INFO
 * ==========================================================
 *
 * FIX ADDED:
 * ----------
 * slug ensures correct identity for pages
 *
 * Example:
 * /index.html               → slug: "index"
 * /products/index.html      → slug: "products"
 * /products/apple.html      → slug: "apple"
 *
 * WHY THIS MATTERS:
 * -----------------
 * Prevents:
 * - SEO file overwrites
 * - Schema mismatches
 * - Broken includes
 *
 * ==========================================================
 */
export function getPageInfo(filePath: string): PageInfo {

  const PROJECT_ROOT = "./"

  /**
   * Normalize file path
   */
  const relative = path.relative(PROJECT_ROOT, filePath)

  /**
   * Extract file name
   */
  const name = path.basename(filePath, ".html")

  /**
   * Split path
   */
  const parts = relative.split(path.sep)

  let type: PageType = "page"
  let collection: string | undefined

  /**
   * Detect collection
   */
  const folder = parts[0]?.toLowerCase()

  if (folder && COLLECTION_TYPE_MAP[folder]) {

    collection = folder

    if (name === "index") {
      type = "archive"
    } else {
      type = COLLECTION_TYPE_MAP[folder]
    }
  }

  /**
   * ----------------------------------------------------------
   * 🔥 SLUG (CRITICAL FIX)
   * ----------------------------------------------------------
   *
   * Fix for nested index pages:
   *
   * /products/index.html → slug = "products"
   * /index.html          → slug = "index"
   */

  let slug = name

  if (name === "index" && collection) {
    slug = collection
  }

  /**
   * URL PATH
   */
  const urlPath =
    name === "index"
      ? collection
        ? `/${collection}`
        : "/"
      : "/" + relative
        .replace(".html", "")
        .replace(/\\/g, "/")

  /**
   * RETURN
   */
  return {
    filePath,
    name,
    slug, 
    urlPath,
    type,
    ...(collection ? { collection } : {})
  }
}