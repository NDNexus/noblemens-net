import fs from "fs"
import path from "path"

import { getPageInfo } from "@utils/page-utils"
import type { PageInfo } from "@utils/page-utils"

import {
    schemaOverrides,
    categorySchema,
    schemaTemplates
} from "@schema/schema-config"

import {
    generateTitle,
    generateDescription
} from "@seo/generate-seo"

/**
 * ==========================================================
 * CONFIG
 * ==========================================================
 */
const ROOT = "./"
const OUTPUT_DIR = "./templates/schema"
const BASE_URL = "https://noblemens.net"

const IGNORE_DIRS = ["node_modules", "dist", "templates", "scripts"]

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

/**
 * ==========================================================
 * CATEGORY RESOLUTION (🔥 MATCHES SEO SYSTEM)
 * ==========================================================
 *
 * Priority:
 * 1. page.category
 * 2. archive slug
 * 3. collection (fallback)
 */
function resolveCategory(page: PageInfo): string | undefined {
    if (page.category) return page.category

    if (page.type === "archive") return page.slug

    return page.collection
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
 * ----------------------------------------------------------
 * SCHEMA BUILDERS (CATEGORY-AWARE)
 * ----------------------------------------------------------
 */

function buildProduct(data: any, page: PageInfo) {

    const categoryKey = resolveCategory(page)
    const categoryData = categorySchema?.[categoryKey || ""]

    const title = generateTitle(page)
    const description = generateDescription(page)

    return {
        "@context": "https://schema.org",
        "@type": "Product",

        name: title,
        description: description,
        image: data.image,

        brand: {
            "@type": "Brand",
            name: categoryData?.brand || data.brand || "Noblemens"
        },

        ...(categoryData?.category && {
            category: categoryData.category
        }),

        ...(data.offers && {
            offers: {
                "@type": "Offer",
                price: data.offers.price,
                priceCurrency: data.offers.priceCurrency,
                availability: data.offers.availability
            }
        })
    }
}

function buildFAQ(data: any) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: data.questions.map((q: any) => ({
            "@type": "Question",
            name: q.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: q.answer
            }
        }))
    }
}

function buildCollection(page: PageInfo) {

    return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: generateTitle(page),
        description: generateDescription(page)
    }
}

function buildArticle(page: PageInfo) {

    return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: generateTitle(page),
        description: generateDescription(page)
    }
}

function buildWebPage(page: PageInfo) {

    return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: generateTitle(page),
        url: BASE_URL + page.urlPath
    }
}

function buildBreadcrumb(page: PageInfo) {

    const parts = page.hierarchy || []

    const items = [
        {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: BASE_URL + "/"
        }
    ]

    let current = ""

    parts.forEach((part, i) => {

        current += `/${part}`

        const name = part
            .replace(/-/g, " ")
            .replace(/\b\w/g, c => c.toUpperCase())

        items.push({
            "@type": "ListItem",
            position: i + 2,
            name,
            item: BASE_URL + current
        })
    })

    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items
    }
}

/**
 * ==========================================================
 * GENERATE SCHEMAS
 * ==========================================================
 */
function generateSchemas(page: PageInfo): any[] {

    const schemas: any[] = []

    const type = schemaTemplates?.[page.type] || "WebPage"

    switch (type) {
        case "WebPage":
            schemas.push(buildWebPage(page))
            break

        case "CollectionPage":
            schemas.push(buildCollection(page))
            break

        case "Product":
            schemas.push(buildProduct({
                image: "/images/og-default.jpg"
            }, page))
            break

        case "Article":
            schemas.push(buildArticle(page))
            break
    }

    /**
     * OVERRIDES (UNCHANGED)
     */
    const overrides = schemaOverrides?.[page.slug]

    if (Array.isArray(overrides)) {
        overrides.forEach((o: any) => {

            switch (o.type) {

                case "Product":
                    schemas.push(buildProduct(o, page))
                    break

                case "FAQPage":
                    schemas.push(buildFAQ(o))
                    break

                case "CollectionPage":
                    schemas.push(buildCollection(page))
                    break

                case "Article":
                    schemas.push(buildArticle(page))
                    break

                case "WebPage":
                    schemas.push(buildWebPage(page))
                    break
            }
        })
    }

    /**
     * ALWAYS ADD BREADCRUMB (NOW HIERARCHY-AWARE 🔥)
     */
    schemas.push(buildBreadcrumb(page))

    return schemas
}

/**
 * CLEAN EXISTING SCHEMA
 */
function cleanSchema(html: string): string {
    return html
        .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, "")
        .replace(/<include src="\/templates\/schema\/.*?"><\/include>/gi, "")
}

/**
 * HEAD MANAGER
 */
function updateHeadIncludes(html: string, includeTag: string): string {
    return html.replace(
        /<head[^>]*>([\s\S]*?)<\/head>/i,
        (_, headContent: string) => {

            let lines = headContent
                .replace(/<include([^>]*)>\s*[\r\n\s]*<\/include>/gi, "<include$1></include>")
                .split("\n")
                .map((line: string) => line.trim())
                .filter(Boolean)

            lines = lines.filter(line => !line.includes("/templates/schema/"))

            lines.push(includeTag)

            const seen = new Set<string>()
            const unique = lines.filter(line => {
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
 * MAIN
 * ==========================================================
 */

const files = getHTMLFiles(ROOT)
const activeTemplates: string[] = []

files.forEach(file => {

    const page = getPageInfo(file)
    const schemas = generateSchemas(page)

    const schemaHTML = schemas
        .map(s => `<script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n</script>`)
        .join("\n\n")

    const filename = `schema-${page.slug}.html`
    const filePath = path.join(OUTPUT_DIR, filename)

    fs.writeFileSync(filePath, schemaHTML)
    activeTemplates.push(filename)

    let html = fs.readFileSync(file, "utf-8")

    html = cleanSchema(html)

    const includeTag = `<include src="/templates/schema/${filename}"></include>`

    html = updateHeadIncludes(html, includeTag)

    html = html.replace(/\n{3,}/g, "\n\n").trim()

    fs.writeFileSync(file, html)

    console.log(`✔ Schema processed → ${page.urlPath}`)
})

fs.readdirSync(OUTPUT_DIR).forEach(file => {
    if (!activeTemplates.includes(file)) {
        fs.unlinkSync(path.join(OUTPUT_DIR, file))
    }
})

console.log("\n✅ Schema system built successfully (CATEGORY-AWARE MODE).\n")