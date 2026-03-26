import path from "path"

/**
 * PAGE TYPES
 * ==========================================================
 *
 * page      → standalone pages (/, /about-us)
 * archive   → collection or category (/products, /products/vinegars)
 * product   → product detail page
 * post      → blog article
 * landing   → marketing pages
 */
export type PageType =
  | "page"
  | "archive"
  | "product"
  | "post"
  | "landing"

/**
 * PAGE INFO STRUCTURE
 * ==========================================================
 *
 * SINGLE SOURCE OF TRUTH for:
 * - SEO
 * - Schema
 * - Sitemap
 * - Breadcrumbs
 *
 * DESIGN PHILOSOPHY:
 * ------------------
 * - Backward compatible (no breaking changes)
 * - Forward scalable (supports hierarchy)
 * - Structure-driven (filesystem = source of truth)
 */
export interface PageInfo {
  filePath: string
  name: string
  slug: string
  urlPath: string
  type: PageType

  /**
   * Top-level grouping (existing behavior)
   * Example:
   * /products/... → "products"
   */
  collection?: string

  /**
   * First-level category inside collection
   * Example:
   * /products/vinegars/... → "vinegars"
   */
  category?: string

  /**
   * Full hierarchy (NEW — critical for scaling)
   * Example:
   * /products/vinegars/apple-cider-vinegar
   * → ["products", "vinegars", "apple-cider-vinegar"]
   */
  hierarchy: string[]
}

/**
 * COLLECTION → TYPE MAP
 * ==========================================================
 *
 * Defines what type of "item" a collection produces
 */
const COLLECTION_TYPE_MAP: Record<string, PageType> = {
  blog: "post",
  products: "product",
  landing: "landing",
}

/**
 * GET PAGE INFO (FINAL • DEPTH-AWARE • NON-BREAKING)
 * ==========================================================
 *
 * CORE RESPONSIBILITY:
 * -------------------
 * Convert file path → structured meaning
 *
 * KEY IMPROVEMENTS:
 * -----------------
 * ✔ Adds hierarchy awareness (no breaking changes)
 * ✔ Extracts category cleanly
 * ✔ Maintains existing collection logic
 * ✔ Improves type detection for deep nesting
 *
 * IMPORTANT:
 * ----------
 * - Existing systems (SEO, Schema) will continue to work
 * - New systems can leverage `category` + `hierarchy`
 *
 * ==========================================================
 */
export function getPageInfo(filePath: string): PageInfo {

  const PROJECT_ROOT = "./"

  /**
   * Normalize path
   */
  const relative = path.relative(PROJECT_ROOT, filePath).replace(/\\/g, "/")

  /**
   * Split path into parts
   * Example:
   * products/vinegars/apple/index.html
   */
  const parts = relative.split("/")

  /**
   * File name without extension
   */
  const name = path.basename(filePath, ".html")

  /**
   * Remove file name → get folder hierarchy
   */
  const segments = parts.slice(0, -1)

  /**
   * Hierarchy (NEW)
   */
  const hierarchy = segments

  /**
   * Detect collection (top-level folder)
   */
  const collection = segments[0]?.toLowerCase()

  /**
   * Detect category (second level)
   */
  const category = segments.length > 1 ? segments[1] : undefined

  /**
   * Determine type
   */
  let type: PageType = "page"

  if (collection && COLLECTION_TYPE_MAP[collection]) {

    const depth = segments.length
    const isIndex = name === "index"

    /**
     * RULES:
     *
     * /products                → archive
     * /products/vinegars       → archive
     * /products/vinegars/apple → product
     */
    if (isIndex) {
      type = "archive"
    } else if (depth >= 2) {
      type = COLLECTION_TYPE_MAP[collection]
    } else {
      type = "archive"
    }
  }

  /**
   * ==========================================================
   * SLUG (CRITICAL)
   * ==========================================================
   */

  let slug = name

  if (name === "index" && collection) {
    slug = segments[segments.length - 1] || collection
  }

  /**
   * ==========================================================
   * URL PATH
   * ==========================================================
   */

  const urlPath =
    name === "index"
      ? "/" + segments.join("/")
      : "/" + relative.replace(".html", "")

  /**
   * Normalize slashes
   */
  const cleanUrl =
    urlPath === "/"
      ? "/"
      : urlPath.replace(/\/+/g, "/")

  /**
   * RETURN FINAL OBJECT
   */
  return {
    filePath,
    name,
    slug,
    urlPath: cleanUrl,
    type,
    hierarchy,
    ...(collection ? { collection } : {}),
    ...(category ? { category } : {})
  }
}