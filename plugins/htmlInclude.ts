/**
 * ==========================================================
 * HTML INCLUDE PLUGIN (SAFE STRING ENGINE • PRODUCTION READY)
 * ==========================================================
 *
 * PURPOSE
 * -------
 * Replaces <include src="..."></include> with file contents.
 *
 * WHY STRING ENGINE?
 * ------------------
 * DOM parsers (like node-html-parser) break custom tags like
 * <include>, causing structural corruption.
 *
 * This plugin uses pure string processing for full control.
 *
 *
 * KEY FEATURES
 * ------------
 * ✔ Recursive includes (nested support)
 * ✔ Circular include protection
 * ✔ File existence validation
 * ✔ In-memory caching (performance)
 * ✔ Absolute + relative path support
 * ✔ Vite dev + build compatible
 *
 *
 * 🔒 SAFETY GUARANTEE
 * ------------------
 * ✔ Ignores <include> inside HTML comments
 * ✔ Prevents accidental execution in docs/comments
 * ✔ Ensures deterministic output across runs
 *
 *
 * INCLUDE SYNTAX
 * --------------
 * <include src="/templates/head.html"></include>
 *
 *
 * PATH RULES
 * ----------
 * Absolute:
 *   /templates/head.html → project root
 *
 * Relative:
 *   ../partials/header.html → current file
 *
 * ==========================================================
 */

import fs from "fs"
import path from "path"
import type { Plugin } from "vite"

export default function htmlInclude(): Plugin {

    /**
     * ----------------------------------------------------------
     * FILE CACHE (PERFORMANCE)
     * ----------------------------------------------------------
     *
     * Prevents repeated disk reads during dev/build.
     */
    const cache = new Map<string, string>()

    function readFile(filePath: string): string {
        if (cache.has(filePath)) return cache.get(filePath)!
        const content = fs.readFileSync(filePath, "utf-8")
        cache.set(filePath, content)
        return content
    }

    /**
     * ----------------------------------------------------------
     * PATH RESOLUTION
     * ----------------------------------------------------------
     *
     * Handles:
     * - Absolute paths (/templates/...)
     * - Relative paths (../partials/...)
     */
    function resolvePath(src: string, from: string): string {
        if (src.startsWith("/")) {
            return path.resolve(process.cwd(), src.slice(1))
        }
        return path.resolve(path.dirname(from), src)
    }

    /**
     * ----------------------------------------------------------
     * COMMENT PROTECTION (CRITICAL)
     * ----------------------------------------------------------
     *
     * Extracts HTML comments so include processing does NOT
     * run inside them.
     *
     * Without this:
     * <include> inside comments would still execute.
     */

    function extractComments(html: string) {
        const comments: string[] = []

        const cleaned = html.replace(/<!--[\s\S]*?-->/g, (match) => {
            comments.push(match)
            return `__HTML_COMMENT_${comments.length - 1}__`
        })

        return { cleaned, comments }
    }

    function restoreComments(html: string, comments: string[]) {
        return html.replace(/__HTML_COMMENT_(\d+)__/g, (_, i) => {
            return comments[Number(i)]
        })
    }

    /**
     * ----------------------------------------------------------
     * INCLUDE PROCESSOR (CORE ENGINE)
     * ----------------------------------------------------------
     *
     * Steps:
     * 1. Protect comments
     * 2. Replace includes recursively
     * 3. Restore comments
     */

    function processIncludes(
        html: string,
        currentFile: string,
        stack = new Set<string>() // prevents circular includes
    ): string {

        /**
         * STEP 1: Protect comments
         */
        const { cleaned, comments } = extractComments(html)

        /**
         * STEP 2: Replace include tags
         *
         * Supports:
         * - <include src="..."></include>
         * - <include src="...">
         */
        const includeRegex =
            /<include\s+src="([^"]+)"\s*>\s*(?:<\/include>)?/gi

        const processed = cleaned.replace(includeRegex, (_, src: string) => {

            const filePath = resolvePath(src, currentFile)

            /**
             * Circular protection
             */
            if (stack.has(filePath)) {
                return `<!-- include: circular (${src}) -->`
            }

            /**
             * File existence check
             */
            if (!fs.existsSync(filePath)) {
                return `<!-- include: not found (${src}) -->`
            }

            /**
             * Recursive resolution
             */
            stack.add(filePath)

            const raw = readFile(filePath).trim()
            const resolved = processIncludes(raw, filePath, stack)

            stack.delete(filePath)

            return resolved
        })

        /**
         * STEP 3: Restore comments
         */
        return restoreComments(processed, comments)
    }

    /**
     * ----------------------------------------------------------
     * VITE PLUGIN HOOKS
     * ----------------------------------------------------------
     */

    return {
        name: "html-include",
        enforce: "pre",

        /**
         * Dev server HTML transform
         */
        transformIndexHtml(html, ctx) {
            return processIncludes(html, ctx.filename || "index.html")
        },

        /**
         * Build-time HTML transform
         */
        transform(code, id) {
            if (id.endsWith(".html")) {
                return processIncludes(code, id)
            }
        },

        /**
         * Cache invalidation (HMR)
         */
        handleHotUpdate({ file }) {
            cache.delete(file)
        }
    }
}