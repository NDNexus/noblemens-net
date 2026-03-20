/**
 * ==========================================================
 * SCHEMA GENERATOR (FULL SYSTEM • DETERMINISTIC • STABLE)
 * ==========================================================
 *
 * PURPOSE
 * -------
 * Generates structured data (JSON-LD) and injects schema includes
 * into <head> WITHOUT duplication or formatting issues.
 *
 * FEATURES
 * --------
 * ✔ Supports multiple schema types:
 *    - WebPage
 *    - Product
 *    - FAQPage
 *    - CollectionPage
 *    - Article
 * ✔ Supports schemaOverrides (per page)
 * ✔ Always generates Breadcrumb schema
 * ✔ Removes old schema scripts + includes
 * ✔ Injects schema include deterministically
 * ✔ Fixes multiline include tag issues
 * ✔ Prevents duplicate includes
 * ✔ Safe across repeated runs (idempotent)
 *
 * RESULT
 * ------
 * <head>
 *   <include src="/templates/schema/schema-page.html"></include>
 * </head>
 *
 * ==========================================================
 */

import fs from "fs"
import path from "path"

import { getPageInfo } from "@utils/page-utils"
import type { PageInfo } from "@utils/page-utils"
import { schemaOverrides } from "@schema/schema-config"

/**
 * ----------------------------------------------------------
 * CONFIG
 * ----------------------------------------------------------
 */

const ROOT = "./"
const OUTPUT_DIR = "./templates/schema"
const BASE_URL = "https://noblemens.net"

const IGNORE_DIRS = ["node_modules", "dist", "templates", "scripts"]

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

/**
 * ----------------------------------------------------------
 * FILE DISCOVERY
 * ----------------------------------------------------------
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
 * SCHEMA BUILDERS
 * ----------------------------------------------------------
 */

function buildProduct(data: any) {
    return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: data.name,
        description: data.description,
        image: data.image,
        brand: {
            "@type": "Brand",
            name: "Noblemens"
        }
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

function buildCollection(data: any) {
    return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: data.name,
        description: data.description
    }
}

function buildArticle(data: any) {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: data.title || data.name,
        description: data.description || ""
    }
}

function buildWebPage(page: PageInfo) {
    return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: page.name,
        url: BASE_URL + page.urlPath
    }
}

function buildBreadcrumb(page: PageInfo) {
    const parts = page.urlPath.split("/").filter(Boolean)

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
 * ----------------------------------------------------------
 * GENERATE SCHEMAS
 * ----------------------------------------------------------
 */

function generateSchemas(page: PageInfo): any[] {

    const schemas: any[] = []

    /**
     * AUTO BASE SCHEMA
     */
    switch (page.type) {

        case "page":
            schemas.push(buildWebPage(page))
            break

        case "archive":
            schemas.push(buildCollection({
                name: page.collection || "Collection",
                description: `${page.collection} collection`
            }))
            break

        case "product":
            schemas.push(buildProduct({
                name: page.name,
                description: "Premium product by Noblemens",
                image: "/images/og-default.jpg"
            }))
            break

        case "post":
            schemas.push(buildArticle(page))
            break
    }

    /**
     * OVERRIDES
     */
    const overrides = schemaOverrides?.[page.name]

    if (Array.isArray(overrides)) {
        overrides.forEach((o: any) => {
            switch (o.type) {
                case "Product": schemas.push(buildProduct(o)); break
                case "FAQPage": schemas.push(buildFAQ(o)); break
                case "CollectionPage": schemas.push(buildCollection(o)); break
                case "Article": schemas.push(buildArticle(o)); break
            }
        })
    }

    /**
     * ALWAYS ADD BREADCRUMB
     */
    schemas.push(buildBreadcrumb(page))

    return schemas
}

/**
 * ----------------------------------------------------------
 * CLEAN OLD SCHEMA
 * ----------------------------------------------------------
 */

function cleanSchema(html: string): string {
    return html
        .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, "")
        .replace(/<include src="\/templates\/schema\/.*?"><\/include>/gi, "")
}

/**
 * ----------------------------------------------------------
 * HEAD MANAGER (CRITICAL FIX)
 * ----------------------------------------------------------
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

            // Remove old schema includes
            lines = lines.filter(line => !line.includes("/templates/schema/"))

            // Add new one
            lines.push(includeTag)

            // Deduplicate
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

/**
 * CLEAN OLD FILES
 */
fs.readdirSync(OUTPUT_DIR).forEach(file => {
    if (!activeTemplates.includes(file)) {
        fs.unlinkSync(path.join(OUTPUT_DIR, file))
    }
})

console.log("\n✅ Schema system built successfully (FULL MODE).\n")