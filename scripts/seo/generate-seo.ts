/**
 * ==========================================================
 * SEO GENERATOR (FINAL • SAFE • DETERMINISTIC)
 * ==========================================================
 *
 * ✔ Keeps ALL existing functionality
 * ✔ Fixes duplicate includes
 * ✔ Fixes multiline include bugs
 * ✔ Prevents re-injection issues
 * ✔ Maintains sitemap generation
 * ✔ Idempotent (safe to run multiple times)
 *
 * ==========================================================
 */

import fs from "fs"
import path from "path"

import { site, overrides } from "@seo/seo-config"
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
 * TITLE
 */
function generateTitle(page: PageInfo): string {
    const override = overrides?.[page.name]

    if (override?.title) return override.title

    if (page.type === "page" && page.name === "index") {
        return `${site.name} | ${site.tagline}`
    }

    if (page.type === "archive" && page.collection) {
        return `${humanize(page.collection)} | ${site.name}`
    }

    return cleanTitle(`${humanize(page.name)} | ${site.name}`)
}

/**
 * META
 */
function generateMeta(page: PageInfo): string {
    const override = overrides?.[page.name] || {}

    const title = generateTitle(page)

    const description = override.description || site.defaultDescription

    const image = override.image
        ? BASE_URL + override.image
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
 * 🔥 CORE FIX — HEAD MANAGER
 */
function updateHeadIncludes(html: string, includeTag: string): string {
    return html.replace(
        /<head[^>]*>([\s\S]*?)<\/head>/i,
        (_, headContent: string) => {

            let normalized = headContent

                /**
                 * Fix:
                 * <include ...>
                 * </include>
                 */
                .replace(
                    /<include([^>]*)>\s*[\r\n\s]*<\/include>/gi,
                    "<include$1></include>"
                )

                /**
                 * Fix:
                 * <include ...>  (NO closing tag)
                 */
                .replace(
                    /<include([^>]*)>(?!\s*<\/include>)/gi,
                    "<include$1></include>"
                )

            /**
             * STEP 2: Split into clean lines
             */
            let lines = normalized
                .split("\n")
                .map((line: string) => line.trim())
                .filter(Boolean)

            /**
             * STEP 3: Remove old SEO includes
             */
            lines = lines.filter(
                (line: string) => !line.includes("/templates/seo/")
            )

            /**
             * STEP 4: Add new include
             */
            lines.push(includeTag)

            /**
             * STEP 5: Deduplicate
             */
            const seen = new Set<string>()
            const unique = lines.filter((line: string) => {
                if (seen.has(line)) return false
                seen.add(line)
                return true
            })

            /**
             * FINAL OUTPUT
             */
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

    /**
     * Write SEO template
     */
    fs.writeFileSync(seoPath, meta.trim())

    activeTemplates.push(filename)

    /**
     * Read HTML
     */
    let html = fs.readFileSync(file, "utf-8")

    html = cleanSEO(html)

    const includeTag =
        `<include src="/templates/seo/${filename}"></include>`

    /**
     * 🔥 FIXED INJECTION
     */
    html = updateHeadIncludes(html, includeTag)

    /**
     * Final cleanup
     */
    html = html.replace(/\n{3,}/g, "\n\n").trim()

    fs.writeFileSync(file, html)

    console.log(`✔ SEO processed → ${page.urlPath}`)

    /**
     * SITEMAP ENTRY
     */
    sitemapEntries.push(`
  <url>
    <loc>${BASE_URL}${page.urlPath}</loc>
  </url>`)
})

/**
 * CLEAN OLD SEO FILES
 */
fs.readdirSync(SEO_DIR).forEach(file => {
    if (!activeTemplates.includes(file)) {
        fs.unlinkSync(path.join(SEO_DIR, file))
    }
})

/**
 * SITEMAP GENERATION
 */
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.join("\n")}
</urlset>
`

fs.writeFileSync(SITEMAP_PATH, sitemap)

console.log("\n✅ SEO system built successfully (clean & stable).\n")