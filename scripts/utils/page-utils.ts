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
 * 
 * PAGE INFO STRUCTURE
 * ==========================================================
 *
 * This is the SINGLE SOURCE OF TRUTH for:
 * - SEO
 * - Schema
 * - Sitemap
 * - Breadcrumbs
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
 * GET PAGE INFO (FINAL • DEPTH-AGNOSTIC • SCALABLE)
 * ==========================================================
 *
 * KEY DESIGN PRINCIPLES:
 *
 * 1. NO depth assumptions
 * 2. Works with infinite nesting
 * 3. Structure-driven (folder-based)
 * 4. Stable for long-term scaling
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

  let type: PageType = "page"
  let collection: string | undefined

  /**
   * Detect collection (top-level folder)
   */
  const folder = parts[0]?.toLowerCase()

  if (folder && COLLECTION_TYPE_MAP[folder]) {

    collection = folder

    const isIndex = name === "index"

    /**
     * RULE:
     * -----
     * index.html → archive (collection or category)
     * anything else → item (product/post)
     */
    if (isIndex) {
      type = "archive"
    } else {
      type = COLLECTION_TYPE_MAP[folder]
    }
  }

  /**
   * ==========================================================
   * SLUG (CRITICAL)
   * ==========================================================
   *
   * Ensures unique identity for pages
   */

  let slug = name

  if (name === "index" && collection) {
    // Use parent folder as slug
    slug = parts[parts.length - 2] || collection
  }

  /**
   * ==========================================================
   * URL PATH
   * ==========================================================
   *
   * Converts file path → clean URL
   */

  const urlPath =
    name === "index"
      ? "/" + parts.slice(0, -1).join("/")
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
    ...(collection ? { collection } : {})
  }
}