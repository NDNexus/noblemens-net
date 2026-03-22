/**
 * ==========================================================
 * SEO GENERATOR (FINAL • PRODUCTION • EXTENSIBLE)
 * ==========================================================
 *
 * ✔ Fully automated SEO
 * ✔ WordPress-level flexibility
 * ✔ Category-level control (categoryMeta)
 * ✔ Product inheritance (categorySEO)
 * ✔ Global templates (seoTemplates)
 * ✔ Page-level overrides (highest priority)
 *
 * PRIORITY ORDER:
 * ----------------
 * 1. overrides
 * 2. categoryMeta
 * 3. categorySEO (inheritance)
 * 4. seoTemplates
 * 5. site defaults
 *
 * ✔ Safe to run multiple times (idempotent)
 * ✔ No duplicate injections
 * ✔ Clean head management
 * ✔ Sitemap generation included
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
 * CONFIG
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
 * FILE DISCOVERY
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
 * UTILITIES
 */
function humanize(str: string): string {
    return str.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())
}

function cleanTitle(title: string): string {
    return title.replace(/\s+/g, " ").trim()
}

/**
 * ==========================================================
 * TEMPLATE PARSER
 * ==========================================================
 */
function parseTemplate(template: string, page: PageInfo) {
    const name = humanize(page.slug)

    return template
        .replace("%site%", site.name)
        .replace("%name%", name)
        .replace("%name_lower%", name.toLowerCase())
        .replace("%collection%", humanize(page.collection || ""))
        .replace("%category%", humanize(page.slug))
        .replace("%category_lower%", humanize(page.slug).toLowerCase())
}

/**
 * ==========================================================
 * TITLE GENERATOR
 * ==========================================================
 */
export function generateTitle(page: PageInfo): string {

    const override = overrides?.[page.slug]
    if (override?.title) return override.title

    // HOME PAGE
    if (page.type === "page" && page.slug === "index") {
        return `${site.name} | ${site.tagline}`
    }

    // CATEGORY META (STRONG CONTROL)
    const categoryMetaData = categoryMeta[page.slug]
    if (page.type === "archive" && categoryMetaData?.title) {
        return categoryMetaData.title
    }

    const categoryKey = page.collection || ""
    const categoryData = categorySEO[categoryKey]

    // PRODUCT INHERITANCE
    if (page.type === "product" && categoryData) {
        return `${humanize(page.slug)} | ${categoryData.keyword} | ${site.name}`
    }

    // CATEGORY FALLBACK
    if (page.type === "archive" && categoryData) {
        return `${humanize(page.slug)} | ${categoryData.keyword} | ${site.name}`
    }

    // TEMPLATE FALLBACK
    const template = seoTemplates[page.type]?.title
    if (template) {
        return parseTemplate(template, page)
    }

    return cleanTitle(`${humanize(page.slug)} | ${site.name}`)
}

/**
 * ==========================================================
 * DESCRIPTION GENERATOR
 * ==========================================================
 */
export function generateDescription(page: PageInfo): string {

    const override = overrides?.[page.slug]
    if (override?.description) return override.description

    const categoryMetaData = categoryMeta[page.slug]
    if (page.type === "archive" && categoryMetaData?.description) {
        return categoryMetaData.description
    }

    const categoryKey = page.collection || ""
    const categoryData = categorySEO[categoryKey]

    // PRODUCT INHERITANCE
    if (page.type === "product" && categoryData) {
        return `Buy ${humanize(page.slug).toLowerCase()} from our ${categoryData.keyword.toLowerCase()} collection. ${categoryData.modifier}.`
    }

    // CATEGORY FALLBACK
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
 * META GENERATOR
 * ==========================================================
 */
function generateMeta(page: PageInfo): string {

    const override = overrides?.[page.slug] || {}

    const title = generateTitle(page)
    const description = generateDescription(page)

    const categoryMetaData = categoryMeta[page.slug]

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
 * REMOVE OLD SEO TAGS
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

/**
 * HEAD MANAGER (UNCHANGED)
 */
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
 * MAIN
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

console.log("\n✅ SEO system built successfully (production-grade).\n")