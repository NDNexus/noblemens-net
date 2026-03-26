/**
 * ==========================================================
 * SEO GENERATOR (CATEGORY-AWARE • PRODUCTION SYSTEM)
 * ==========================================================
 *
 * OVERVIEW
 * --------
 * This system automatically generates SEO metadata for all HTML pages
 * and injects them into the <head> using a template include system.
 *
 * It is:
 * ✔ Fully automated
 * ✔ Idempotent (safe to re-run)
 * ✔ Category-aware (NEW)
 * ✔ Hierarchy-compatible
 * ✔ Scalable for large content systems
 *
 * ----------------------------------------------------------
 *
 * CORE RESPONSIBILITIES
 * ---------------------
 * 1. Discover all HTML files in the project
 * 2. Extract structured page data via getPageInfo()
 * 3. Generate:
 *    - <title>
 *    - meta description
 *    - canonical URL
 *    - Open Graph tags
 *    - Twitter tags
 * 4. Inject SEO via template includes
 * 5. Generate sitemap.xml
 *
 * ----------------------------------------------------------
 *
 * ARCHITECTURE (PRIORITY SYSTEM)
 * ----------------------------------------------------------
 *
 * SEO values are resolved using the following priority:
 *
 * 1. overrides        → manual page-level control (highest priority)
 * 2. categoryMeta     → category-level SEO (titles, descriptions, images)
 * 3. categorySEO      → keyword + positioning (used for inheritance)
 * 4. seoTemplates     → automatic fallback templates
 * 5. site defaults    → global fallback
 *
 * This ensures:
 * ✔ Flexibility where needed
 * ✔ Automation everywhere else
 *
 * ----------------------------------------------------------
 *
 * 🔥 CATEGORY-AWARE UPGRADE (IMPORTANT)
 * ----------------------------------------------------------
 *
 * Previous system relied on:
 *   page.collection (e.g. "products")
 *
 * New system uses:
 *   page.category (e.g. "vinegars", "perfumes")
 *
 * This allows:
 * ✔ Precise SEO targeting
 * ✔ Better keyword relevance
 * ✔ Category-level branding
 *
 * ----------------------------------------------------------
 *
 * CATEGORY RESOLUTION LOGIC
 * ----------------------------------------------------------
 *
 * resolveCategory(page):
 *
 * Priority:
 * 1. page.category      → primary (NEW system)
 * 2. page.slug          → for archive pages (/vinegars)
 * 3. page.collection    → fallback (legacy support)
 *
 * This ensures backward compatibility with older structure.
 *
 * ----------------------------------------------------------
 *
 * TEMPLATE SYSTEM
 * ----------------------------------------------------------
 *
 * seoTemplates define reusable patterns using variables:
 *
 * %site%            → site name
 * %name%            → humanized slug
 * %name_lower%      → lowercase name
 * %collection%      → top-level grouping
 * %category%        → resolved category
 * %category_lower%  → lowercase category
 *
 * Example:
 *
 * "%name% | Buy %name% | %site%"
 *
 * ----------------------------------------------------------
 *
 * CATEGORY CONFIG SYSTEM
 * ----------------------------------------------------------
 *
 * categoryMeta:
 *   - Controls category-specific titles, descriptions, images
 *   - Used mainly for archive pages
 *
 * categorySEO:
 *   - Defines keyword + modifier
 *   - Used for:
 *     ✔ product pages
 *     ✔ category fallback SEO
 *
 * Example:
 *
 * categorySEO["vinegars"] = {
 *   keyword: "Natural Vinegar",
 *   modifier: "Pure & Unfiltered"
 * }
 *
 * ----------------------------------------------------------
 *
 * META GENERATION
 * ----------------------------------------------------------
 *
 * Generated tags include:
 *
 * ✔ <title>
 * ✔ <meta name="description">
 * ✔ <link rel="canonical">
 *
 * ✔ Open Graph:
 *    - og:title
 *    - og:description
 *    - og:image
 *    - og:url
 *
 * ✔ Twitter:
 *    - twitter:title
 *    - twitter:description
 *    - twitter:image
 *
 * Image priority:
 * 1. override.image
 * 2. categoryMeta.image
 * 3. site.defaultImage
 *
 * ----------------------------------------------------------
 *
 * TEMPLATE INJECTION SYSTEM
 * ----------------------------------------------------------
 *
 * SEO is NOT directly embedded.
 *
 * Instead:
 *
 * 1. A template file is generated:
 *    /templates/seo/seo-{slug}.html
 *
 * 2. HTML pages include:
 *    <include src="/templates/seo/seo-{slug}.html"></include>
 *
 * Benefits:
 * ✔ Clean HTML files
 * ✔ Reusable system
 * ✔ Easy debugging
 * ✔ Idempotent updates
 *
 * ----------------------------------------------------------
 *
 * CLEANING MECHANISM
 * ----------------------------------------------------------
 *
 * Before injecting new SEO:
 * ✔ Old <title> tags are removed
 * ✔ Old meta tags are removed
 * ✔ Old include references are removed
 *
 * Ensures:
 * ✔ No duplication
 * ✔ Clean output every run
 *
 * ----------------------------------------------------------
 *
 * SITEMAP GENERATION
 * ----------------------------------------------------------
 *
 * Automatically generates:
 *
 * /public/sitemap.xml
 *
 * Includes all discovered pages:
 *
 * <url>
 *   <loc>https://example.com/page</loc>
 * </url>
 *
 * ----------------------------------------------------------
 *
 * FILE DISCOVERY RULES
 * ----------------------------------------------------------
 *
 * Scans entire project recursively
 * Ignores:
 * - node_modules
 * - dist
 * - templates
 * - scripts
 *
 * Only processes:
 * ✔ .html files
 *
 * ----------------------------------------------------------
 *
 * SAFETY & DESIGN PRINCIPLES
 * ----------------------------------------------------------
 *
 * ✔ Idempotent (safe to run multiple times)
 * ✔ Deterministic output
 * ✔ No hidden side effects
 * ✔ Backward compatible
 * ✔ Config-driven (not hardcoded)
 *
 * ----------------------------------------------------------
 *
 * HOW TO EXTEND
 * ----------------------------------------------------------
 *
 * To add new SEO behavior:
 *
 * ✔ Add category → update categoryMeta + categorySEO
 * ✔ Add page override → update overrides
 * ✔ Add new template → extend seoTemplates
 *
 * DO NOT:
 * ✘ Hardcode values in generator
 * ✘ Bypass priority system
 *
 * ----------------------------------------------------------
 *
 * FUTURE EXTENSIONS (READY)
 * ----------------------------------------------------------
 *
 * This system is already compatible with:
 *
 * ✔ Markdown → HTML pipelines
 * ✔ CMS integration (Sanity, etc.)
 * ✔ Dynamic page generation
 * ✔ Programmatic SEO pages
 *
 * ----------------------------------------------------------
 *
 * FINAL NOTE
 * ----------------------------------------------------------
 *
 * This is not just an SEO script.
 *
 * It is a:
 * → Deterministic SEO engine
 * → Config-driven content intelligence layer
 *
 * Treat getPageInfo() as the source of truth.
 *
 * ==========================================================
 */


import fs from "fs"
import path from "path"

import {
    site,
    overrides,
    seoTemplates,
    categorySEO,
    categoryMeta
} from "@seo/seo-config"

import { getPageInfo } from "@utils/page-utils"
import type { PageInfo } from "@utils/page-utils"

/**
 * ==========================================================
 * CONFIG
 * ==========================================================
 */
const ROOT = "./"
const SEO_DIR = "./templates/seo"
const SITEMAP_PATH = "./public/sitemap.xml"
const BASE_URL = site.url

const IGNORE_DIRS = ["node_modules", "dist", "templates", "scripts"]

if (!fs.existsSync(SEO_DIR)) {
    fs.mkdirSync(SEO_DIR, { recursive: true })
}

/**
 * ==========================================================
 * FILE DISCOVERY
 * ==========================================================
 */
function getHTMLFiles(dir: string): string[] {
    let results: string[] = []

    const files = fs.readdirSync(dir)

    files.forEach(file => {
        const fullPath = path.join(dir, file)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
            if (IGNORE_DIRS.includes(file)) return
            results = results.concat(getHTMLFiles(fullPath))
        } else if (file.endsWith(".html")) {
            results.push(fullPath)
        }
    })

    return results
}

/**
 * ==========================================================
 * UTILITIES
 * ==========================================================
 */
function humanize(str: string): string {
    return str.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())
}

function cleanTitle(title: string): string {
    return title.replace(/\s+/g, " ").trim()
}

/**
 * ==========================================================
 * CATEGORY RESOLUTION (🔥 NEW CORE LOGIC)
 * ==========================================================
 *
 * Priority:
 * 1. page.category (new system)
 * 2. fallback to slug (for archive pages like /vinegars)
 * 3. fallback to collection (legacy support)
 */
function resolveCategory(page: PageInfo): string | undefined {
    if (page.category) return page.category

    // archive pages like /vinegars
    if (page.type === "archive") return page.slug

    return page.collection
}

/**
 * ==========================================================
 * TEMPLATE PARSER
 * ==========================================================
 */
function parseTemplate(template: string, page: PageInfo) {
    const name = humanize(page.slug)
    const category = humanize(resolveCategory(page) || "")
    const collection = humanize(page.collection || "")

    return template
        .replace("%site%", site.name)
        .replace("%name%", name)
        .replace("%name_lower%", name.toLowerCase())
        .replace("%collection%", collection)
        .replace("%category%", category)
        .replace("%category_lower%", category.toLowerCase())
}

/**
 * ==========================================================
 * TITLE GENERATOR (UPGRADED)
 * ==========================================================
 */
export function generateTitle(page: PageInfo): string {

    const override = overrides?.[page.slug]
    if (override?.title) return override.title

    // HOME PAGE
    if (page.type === "page" && page.slug === "index") {
        return `${site.name} | ${site.tagline}`
    }

    const categoryKey = resolveCategory(page)

    /**
     * CATEGORY META (STRONG CONTROL)
     */
    const categoryMetaData = categoryMeta[categoryKey || ""]
    if (page.type === "archive" && categoryMetaData?.title) {
        return categoryMetaData.title
    }

    /**
     * CATEGORY SEO (INHERITANCE)
     */
    const categoryData = categorySEO[categoryKey || ""]

    // PRODUCT
    if (page.type === "product" && categoryData) {
        return `${humanize(page.slug)} | ${categoryData.keyword} | ${site.name}`
    }

    // CATEGORY
    if (page.type === "archive" && categoryData) {
        return `${humanize(page.slug)} | ${categoryData.keyword} | ${site.name}`
    }

    /**
     * TEMPLATE FALLBACK
     */
    const template = seoTemplates[page.type]?.title
    if (template) {
        return parseTemplate(template, page)
    }

    return cleanTitle(`${humanize(page.slug)} | ${site.name}`)
}

/**
 * ==========================================================
 * DESCRIPTION GENERATOR (UPGRADED)
 * ==========================================================
 */
export function generateDescription(page: PageInfo): string {

    const override = overrides?.[page.slug]
    if (override?.description) return override.description

    const categoryKey = resolveCategory(page)

    const categoryMetaData = categoryMeta[categoryKey || ""]
    if (page.type === "archive" && categoryMetaData?.description) {
        return categoryMetaData.description
    }

    const categoryData = categorySEO[categoryKey || ""]

    // PRODUCT
    if (page.type === "product" && categoryData) {
        return `Buy ${humanize(page.slug).toLowerCase()} from our ${categoryData.keyword.toLowerCase()} collection. ${categoryData.modifier}.`
    }

    // CATEGORY
    if (page.type === "archive" && categoryData) {
        return `Explore ${humanize(page.slug).toLowerCase()} under our ${categoryData.keyword.toLowerCase()} range. ${categoryData.modifier}.`
    }

    const template = seoTemplates[page.type]?.description
    if (template) {
        return parseTemplate(template, page)
    }

    return site.defaultDescription
}

/**
 * ==========================================================
 * META GENERATOR (UNCHANGED BUT NOW CATEGORY-AWARE)
 * ==========================================================
 */
function generateMeta(page: PageInfo): string {

    const override = overrides?.[page.slug] || {}

    const title = generateTitle(page)
    const description = generateDescription(page)

    const categoryKey = resolveCategory(page)
    const categoryMetaData = categoryMeta[categoryKey || ""]

    const image = override.image
        ? BASE_URL + override.image
        : categoryMetaData?.image
            ? BASE_URL + categoryMetaData.image
            : BASE_URL + site.defaultImage

    const url = BASE_URL + page.urlPath

    return `<title>${title}</title>

<meta name="description" content="${description}">
<link rel="canonical" href="${url}">

<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${image}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${image}">
`
}

/**
 * ==========================================================
 * REMAINING SYSTEM (UNCHANGED)
 * ==========================================================
 */

function cleanSEO(html: string): string {
    return html
        .replace(/<title>[\s\S]*?<\/title>/gi, "")
        .replace(/<meta name="description"[^>]*>/gi, "")
        .replace(/<link rel="canonical"[^>]*>/gi, "")
        .replace(/<meta property="og:[^>]*>/gi, "")
        .replace(/<meta name="twitter:[^>]*>/gi, "")
        .replace(/<include src="\/templates\/seo\/seo-.*?\.html"><\/include>/gi, "")
}

function updateHeadIncludes(html: string, includeTag: string): string {
    return html.replace(
        /<head[^>]*>([\s\S]*?)<\/head>/i,
        (_, headContent: string) => {

            let normalized = headContent
                .replace(/<include([^>]*)>\s*[\r\n\s]*<\/include>/gi, "<include$1></include>")
                .replace(/<include([^>]*)>(?!\s*<\/include>)/gi, "<include$1></include>")

            let lines = normalized
                .split("\n")
                .map((line: string) => line.trim())
                .filter(Boolean)

            lines = lines.filter(
                (line: string) => !line.includes("/templates/seo/")
            )

            lines.push(includeTag)

            const seen = new Set<string>()
            const unique = lines.filter((line: string) => {
                if (seen.has(line)) return false
                seen.add(line)
                return true
            })

            return `<head>\n${unique.join("\n")}\n</head>`
        }
    )
}

/**
 * ==========================================================
 * MAIN EXECUTION (UNCHANGED)
 * ==========================================================
 */

const files = getHTMLFiles(ROOT)

const sitemapEntries: string[] = []
const activeTemplates: string[] = []

files.forEach(file => {

    const page = getPageInfo(file)
    const meta = generateMeta(page)

    const filename = `seo-${page.slug}.html`
    const seoPath = path.join(SEO_DIR, filename)

    fs.writeFileSync(seoPath, meta.trim())

    activeTemplates.push(filename)

    let html = fs.readFileSync(file, "utf-8")

    html = cleanSEO(html)

    const includeTag =
        `<include src="/templates/seo/${filename}"></include>`

    html = updateHeadIncludes(html, includeTag)

    html = html.replace(/\n{3,}/g, "\n\n").trim()

    fs.writeFileSync(file, html)

    console.log(`✔ SEO processed → ${page.urlPath}`)

    sitemapEntries.push(`
  <url>
    <loc>${BASE_URL}${page.urlPath}</loc>
  </url>`)
})

fs.readdirSync(SEO_DIR).forEach(file => {
    if (!activeTemplates.includes(file)) {
        fs.unlinkSync(path.join(SEO_DIR, file))
    }
})

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.join("\n")}
</urlset>
`

fs.writeFileSync(SITEMAP_PATH, sitemap)

console.log("\n✅ SEO system built successfully (CATEGORY-AWARE MODE).\n")