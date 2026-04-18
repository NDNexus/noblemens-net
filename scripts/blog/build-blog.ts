/**
 * ==========================================================
 * BLOG BUILD PIPELINE (PRODUCTION • SYSTEM-ALIGNED)
 * ==========================================================
 *
 * OVERVIEW
 * ----------------------------------------------------------
 * This script is responsible for transforming Markdown-based
 * blog content into fully rendered static HTML pages and a
 * structured data index used by the frontend.
 *
 * It acts as a bridge between:
 *
 *   AUTHORING LAYER  → /content/blog/*.md
 *   RENDERED OUTPUT  → /articles/.../index.html
 *   DATA LAYER       → /src/data/posts.ts
 *
 * ----------------------------------------------------------
 *
 * CORE RESPONSIBILITIES
 * ----------------------------------------------------------
 * 1. Discover markdown files recursively
 * 2. Parse frontmatter using gray-matter
 * 3. Convert markdown → HTML using marked
 * 4. Enhance content (TOC generation, table safety)
 * 5. Inject content into HTML template
 * 6. Generate clean, filesystem-based routes
 * 7. Write static HTML pages to /articles
 * 8. Generate centralized blog index (posts.ts)
 *
 * ----------------------------------------------------------
 *
 * ARCHITECTURE PRINCIPLES
 * ----------------------------------------------------------
 *
 * 1. FILESYSTEM-DRIVEN ROUTING
 *    --------------------------------------------------------
 *    URL structure is derived from folder structure.
 *
 *    Example:
 *    /content/blog/health/acv.md
 *        ↓
 *    /articles/health/acv/index.html
 *        ↓
 *    URL: /articles/health/acv
 *
 *    Routing metadata is resolved via:
 *    → getPageInfo() (SINGLE SOURCE OF TRUTH)
 *
 *
 * 2. SINGLE SOURCE OF TRUTH (CRITICAL)
 *    --------------------------------------------------------
 *    DO NOT manually compute:
 *    - slug
 *    - url
 *    - hierarchy
 *
 *    ALWAYS use:
 *    → getPageInfo(filePath)
 *
 *
 * 3. SEPARATION OF CONCERNS
 *    --------------------------------------------------------
 *    CONTENT (authoring)
 *      → /content/blog
 *
 *    BUILD LOGIC
 *      → this script
 *
 *    ROUTING LOGIC
 *      → getPageInfo()
 *
 *    UI DATA LAYER
 *      → /src/data/posts.ts
 *
 *
 * 4. DATA PIPELINE
 *    --------------------------------------------------------
 *    Markdown (source)
 *        ↓
 *    buildPost() → HTML + metadata
 *        ↓
 *    buildBlog() → aggregates posts
 *        ↓
 *    createBlogIndex() → outputs posts.ts
 *        ↓
 *    Frontend UI consumes structured data
 *
 *
 * ----------------------------------------------------------
 *
 * FRONTMATTER SPECIFICATION
 * ----------------------------------------------------------
 *
 * Each markdown file must define:
 *
 * ---
 * title: Blog Title
 * description: Short summary (SEO + preview)
 * date: YYYY-MM-DD
 * updated: YYYY-MM-DD (optional)
 * image: /images/blog/example.jpg
 * tags: [optional, array]
 * ---
 *
 *
 * ----------------------------------------------------------
 *
 * OUTPUT STRUCTURE
 * ----------------------------------------------------------
 *
 * 1. Static Pages
 *    /articles/.../index.html
 *
 * 2. Data Index (UI Layer)
 *    /src/data/posts.ts
 *
 *    Example:
 *    export const posts = [
 *      {
 *        title,
 *        slug,
 *        url,
 *        category,
 *        hierarchy,
 *        date,
 *        image,
 *        tags
 *      }
 *    ]
 *
 *
 * ----------------------------------------------------------
 *
 * NON-RESPONSIBILITIES
 * ----------------------------------------------------------
 *
 * This script DOES NOT handle:
 *
 * ✖ SEO meta tags
 * ✖ Schema generation
 * ✖ Sitemap generation
 * ✖ Frontend rendering
 *
 * These are handled by separate systems.
 *
 *
 * ----------------------------------------------------------
 *
 * EXTENSIBILITY
 * ----------------------------------------------------------
 *
 * This pipeline pattern is reusable for:
 *
 * - Products
 * - Guides
 * - Case Studies
 *
 * By creating:
 *   build-*.ts → create*Index()
 *
 *
 * ----------------------------------------------------------
 *
 * SAFETY NOTES
 * ----------------------------------------------------------
 *
 * - Output files are fully regenerated on each run
 * - posts.ts is AUTO-GENERATED — DO NOT EDIT manually
 * - Missing frontmatter fields fallback safely
 *
 *
 * ==========================================================
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import { buildTOC } from "./toc-builder";
import { getPageInfo } from "@utils/page-utils";
import { getReadingTime } from "@lib/readingTime";

/**
 * ==========================================================
 * CONFIG
 * ==========================================================
 */

const CONTENT_DIR = path.resolve("./content/blog");
const OUTPUT_DIR = path.resolve("./articles");
const TEMPLATE_PATH = path.resolve("./templates/blog/blog-post.html");

/**
 * ==========================================================
 * RECURSIVE MARKDOWN DISCOVERY
 * ==========================================================
 */
function getMarkdownFiles(dir: string): string[] {
    let results: string[] = [];

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            results = results.concat(getMarkdownFiles(fullPath));
        } else if (file.endsWith(".md")) {
            results.push(fullPath);
        }
    }

    return results;
}

/**
 * ==========================================================
 * BUILD SINGLE BLOG POST
 * ==========================================================
 *
 * RESPONSIBILITY:
 * - Convert markdown → HTML
 * - Inject template
 * - Write output file
 * - RETURN metadata (for blog index)
 */
function buildPost(filePath: string, template: string) {

    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    /**
     * BASIC VALIDATION
     */
    if (!data.title) {
        console.warn(`⚠ Missing title → ${filePath}`);
    }

    /**
     * MARKDOWN → HTML
     */
    const rawHtml = marked.parse(content, { async: false }) as string;

    /**
     * TABLE SAFETY WRAPPER
     */
    function wrapTables(html: string): string {
        return html.replace(
            /<table>([\s\S]*?)<\/table>/g,
            `<div class="table-wrapper"><table>$1</table></div>`
        );
    }

    const tableSafeHtml = wrapTables(rawHtml);

    /**
     * TOC GENERATION
     */
    const { content: htmlContent, toc } = buildTOC(tableSafeHtml);

    /**
     * RESOLVE OUTPUT PATH (filesystem-driven routing)
     */
    const relative = path.relative(CONTENT_DIR, filePath);
    const cleanPath = relative.replace(/\.md$/, "");
    const parts = cleanPath.split(path.sep);
    const slug = parts.pop();

    if (!slug) {
        console.error(`❌ Invalid slug → ${filePath}`);
        return null;
    }

    const outputDir = path.join(OUTPUT_DIR, ...parts, slug);
    fs.mkdirSync(outputDir, { recursive: true });

    /**
     * TEMPLATE INJECTION
     */
    const finalHtml = template
        .replace(/{{title}}/g, data.title || "Untitled")
        .replace(/{{description}}/g, data.description || "")
        .replace(/{{content}}/g, htmlContent)
        .replace(/{{toc}}/g, toc);

    /**
     * WRITE HTML FILE
     */
    const outputFilePath = path.join(outputDir, "index.html");
    fs.writeFileSync(outputFilePath, finalHtml);

    console.log(`✔ Generated → /articles/${[...parts, slug].join("/")}`);

    /**
     * ==========================================================
     * EXTRACT STRUCTURED PAGE INFO (CRITICAL)
     * ==========================================================
     *
     * DO NOT manually compute slug or URL.
     * Use your centralized system.
     */
    const pageInfo = getPageInfo(outputFilePath);

    const reading = getReadingTime(content);

    /**
     * RETURN METADATA FOR INDEX GENERATION
     */
    return {
        title: data.title || "Untitled",
        description: data.description || "",
        image: data.image || "",
        date: data.date || "",
        updated: data.updated || "",
        tags: data.tags || [],

        /* READING TIME ESTIMATION (from content) */
        readingTime: reading,
        wordCount: reading.words,

        /**
         * STRUCTURE (from PageInfo system)
         */
        slug: pageInfo.slug,
        url: pageInfo.urlPath,
        category: pageInfo.category || "blog",
        hierarchy: pageInfo.hierarchy,
    };
}

/**
 * ==========================================================
 * CREATE BLOG INDEX (posts.ts)
 * ==========================================================
 *
 * PURPOSE:
 * - Generate centralized UI-ready dataset
 * - Used by blog listing page
 */
function createBlogIndex(posts: any[]) {

    const outputPath = path.resolve("./src/data/posts.ts");

    /**
     * SORT POSTS (latest first)
     */
    posts.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    /**
     * GENERATE FILE CONTENT
     */
    const fileContent = `
/* AUTO-GENERATED FILE — DO NOT EDIT (Handled by scripts/blog/build-blog.ts) */

export const posts = ${JSON.stringify(posts, null, 2)};
`;

    /**
     * ENSURE DIRECTORY EXISTS
     */
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    /**
     * WRITE FILE
     */
    fs.writeFileSync(outputPath, fileContent);

    console.log("📦 Blog index generated → /src/data/posts.ts");
}

/**
 * ==========================================================
 * MAIN BUILD FUNCTION
 * ==========================================================
 *
 * ORCHESTRATES:
 * - Build all posts
 * - Collect metadata
 * - Generate index
 */
function buildBlog() {

    console.log("\n🚀 Building blog...\n");

    /**
     * TEMPLATE VALIDATION
     */
    if (!fs.existsSync(TEMPLATE_PATH)) {
        console.error("❌ Blog template not found.");
        return;
    }

    const template = fs.readFileSync(TEMPLATE_PATH, "utf-8");

    /**
     * DISCOVER MARKDOWN FILES
     */
    const files = getMarkdownFiles(CONTENT_DIR);

    if (files.length === 0) {
        console.warn("⚠ No markdown files found.");
        return;
    }

    /**
     * COLLECT POSTS
     */
    const posts: any[] = [];

    files.forEach(file => {
        const result = buildPost(file, template);
        if (result) posts.push(result);
    });

    /**
     * GENERATE BLOG INDEX
     */
    createBlogIndex(posts);

    console.log("\n✅ Blog build complete.\n");
}

/**
 * ==========================================================
 * RUN BUILD
 * ==========================================================
 */
buildBlog();