/**
 * ==========================================================
 * BLOG BUILD PIPELINE (MARKDOWN → HTML)
 * ==========================================================
 *
 * PURPOSE
 * ----------------------------------------------------------
 * Converts markdown blog content into structured HTML pages
 * using a reusable template system.
 *
 * Integrates with:
 * ✔ Routing system (folder-based URLs)
 * ✔ SEO generator (runs later)
 * ✔ Schema generator (runs later)
 * ✔ TOC system (auto-generated navigation)
 *
 * ----------------------------------------------------------
 *
 * ARCHITECTURE
 * ----------------------------------------------------------
 *
 * /content/blog (PRIVATE markdown)
 *        ↓
 * build-blog.ts (THIS SCRIPT)
 *        ↓
 * /articles/.../index.html (PUBLIC pages)
 *        ↓
 * SEO + Schema pipelines
 *
 * ----------------------------------------------------------
 *
 * TEMPLATE SYSTEM
 * ----------------------------------------------------------
 *
 * Template file:
 * /templates/blog/blog-post.html
 *
 * Supported placeholders:
 *
 * {{title}}        → Blog title
 * {{description}}  → Blog description
 * {{content}}      → Parsed HTML content
 * {{toc}}          → Generated Table of Contents
 *
 * ----------------------------------------------------------
 *
 * FEATURES
 * ----------------------------------------------------------
 *
 * ✔ Recursive markdown discovery
 * ✔ Frontmatter parsing (gray-matter)
 * ✔ Markdown → HTML conversion (marked)
 * ✔ TOC generation (config-driven)
 * ✔ Template injection system
 * ✔ Clean URL structure (index.html)
 * ✔ Safe directory creation
 * ✔ Production-safe logging
 *
 * ----------------------------------------------------------
 *
 * FRONTMATTER FORMAT
 * ----------------------------------------------------------
 *
 * ---
 * title: Blog Title
 * description: Short description
 * date: 2026-03-25
 * updated: 2026-03-25
 * image: /images/blog/example.jpg
 * ---
 *
 * ----------------------------------------------------------
 *
 * IMPORTANT
 * ----------------------------------------------------------
 *
 * - This script ONLY generates HTML
 * - SEO + Schema are handled separately
 * - Do NOT add meta tags here
 *
 * ==========================================================
 */

import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { marked } from "marked"
import { buildTOC } from "./toc-builder"

/**
 * ==========================================================
 * CONFIG
 * ==========================================================
 */

const CONTENT_DIR = path.resolve("./content/blog")
const OUTPUT_DIR = path.resolve("./articles")
const TEMPLATE_PATH = path.resolve("./templates/blog/blog-post.html")

/**
 * ==========================================================
 * RECURSIVE MARKDOWN DISCOVERY
 * ==========================================================
 */
function getMarkdownFiles(dir: string): string[] {
    let results: string[] = []

    const files = fs.readdirSync(dir)

    for (const file of files) {
        const fullPath = path.join(dir, file)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
            results = results.concat(getMarkdownFiles(fullPath))
        } else if (file.endsWith(".md")) {
            results.push(fullPath)
        }
    }

    return results
}

/**
 * ==========================================================
 * BUILD SINGLE POST
 * ==========================================================
 */
function buildPost(filePath: string, template: string) {

    const raw = fs.readFileSync(filePath, "utf-8")

    const { data, content } = matter(raw)

    /**
     * BASIC VALIDATION
     */
    if (!data.title) {
        console.warn(`⚠ Missing title → ${filePath}`)
    }

    /**
     * Markdown → HTML
     */
    const rawHtml = marked.parse(content, { async: false }) as string;

    /**
     * Wrap tables for safe overflow handling
     */
    function wrapTables(html: string): string {
        return html.replace(
            /<table>([\s\S]*?)<\/table>/g,
            `<div class="table-wrapper"><table>$1</table></div>`
        );
    }

    /**
     * Wrap Markdown tables with div of class table-wrapper for making sure it stays responsive.
     */

    const tableSafeHtml = wrapTables(rawHtml);

    /**
    * Generate TOC + IDs after html has been processed for tables
    */
    const { content: htmlContent, toc } = buildTOC(tableSafeHtml);

    
    /**
     * Resolve output path
     */
    const relative = path.relative(CONTENT_DIR, filePath)
    const cleanPath = relative.replace(/\.md$/, "")

    const parts = cleanPath.split(path.sep)
    const slug = parts.pop()

    if (!slug) {
        console.error(`❌ Invalid slug → ${filePath}`)
        return
    }

    const outputDir = path.join(OUTPUT_DIR, ...parts, slug)
    fs.mkdirSync(outputDir, { recursive: true })

    /**
     * Inject into template
     */
    const finalHtml = template
        .replace(/{{title}}/g, data.title || "Untitled")
        .replace(/{{description}}/g, data.description || "")
        .replace(/{{content}}/g, htmlContent)
        .replace(/{{toc}}/g, toc)

    /**
     * Write output
     */
    fs.writeFileSync(path.join(outputDir, "index.html"), finalHtml)

    console.log(`✔ Generated → /articles/${[...parts, slug].join("/")}`)
}

/**
 * ==========================================================
 * MAIN BUILD FUNCTION
 * ==========================================================
 */
function buildBlog() {

    console.log("\n🚀 Building blog...\n")

    /**
     * Load template ONCE (performance)
     */
    if (!fs.existsSync(TEMPLATE_PATH)) {
        console.error("❌ Blog template not found.")
        return
    }

    const template = fs.readFileSync(TEMPLATE_PATH, "utf-8")

    const files = getMarkdownFiles(CONTENT_DIR)

    if (files.length === 0) {
        console.warn("⚠ No markdown files found.")
        return
    }

    files.forEach(file => {
        buildPost(file, template)
    })

    console.log("\n✅ Blog build complete.\n")
}

/**
 * ==========================================================
 * RUN
 * ==========================================================
 */
buildBlog()