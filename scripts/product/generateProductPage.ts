/**
 * =========================================================
 * GENERATE PRODUCT PAGE
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Writes the FINAL generated product HTML into the correct
 * filesystem location using the product's resolved
 * hierarchy structure.
 *
 * EXAMPLE OUTPUT
 * ---------------------------------------------------------
 * /products/vinegars/apple-cider-vinegar/index.html
 *
 * HIERARCHY SOURCE
 * ---------------------------------------------------------
 * Uses:
 *   product.hierarchy
 *
 * Example:
 * [
 *   "products",
 *   "vinegars",
 *   "apple-cider-vinegar"
 * ]
 *
 * RESPONSIBILITIES
 * ---------------------------------------------------------
 * - Generate folder structure
 * - Create directories recursively
 * - Write final HTML files
 * - Return generated output path
 * - Sanitize filesystem path segments
 *
 * DOES NOT:
 * ---------------------------------------------------------
 * - Fetch Sanity data
 * - Render HTML
 * - Process SEO
 * - Resolve includes
 * - Generate schema
 * - Minify output
 *
 * =========================================================
 * * Root output folder
 *
 * Default:
 * "."
 *
 * Final hierarchy already includes:
 * "products"
 */

import fs from "fs/promises"
import path from "path"

import type { ProductDetail } from "@/data/types/productDetail"

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

export interface GenerateProductPageOptions {

    /**
     * Final rendered HTML string
     */
    html: string

    /**
     * Fully mapped product
     */
    product: ProductDetail

    /**
     * Root output folder
     * Default: .
     */
    outputRoot?: string
}

/**
 * =========================================================
 * MAIN GENERATOR
 * =========================================================
 */

export async function generateProductPage({
    html,
    product,
    outputRoot = "."
}: GenerateProductPageOptions): Promise<string> {

    /**
     * -----------------------------------------------------
     * VALIDATION
     * -----------------------------------------------------
     */

    if (!html?.trim()) {
        throw new Error(
            `[GenerateProductPage] HTML is empty for "${product.title}"`
        )
    }

    if (!product.slug) {
        throw new Error(
            `[GenerateProductPage] Missing product slug`
        )
    }

    /**
     * -----------------------------------------------------
     * HIERARCHY
     * -----------------------------------------------------
     *
     * Example:
     * [
     *   "products",
     *   "vinegars",
     *   "apple-cider-vinegar"
     * ]
     */

    const hierarchy =
        product.hierarchy?.length
            ? product.hierarchy
            : ["products", product.slug]

    /**
     * -----------------------------------------------------
     * BUILD FINAL PATH SEGMENTS
     * -----------------------------------------------------
     */

    const segments = [
        outputRoot,

        ...hierarchy.map(segment =>
            sanitizePathSegment(segment)
        )
    ]

    /**
     * -----------------------------------------------------
     * FINAL DIRECTORY
     * -----------------------------------------------------
     */

    const productDir =
        path.resolve(...segments)

    /**
     * -----------------------------------------------------
     * CREATE DIRECTORY
     * -----------------------------------------------------
     */

    await fs.mkdir(productDir, {
        recursive: true
    })

    /**
     * -----------------------------------------------------
     * FINAL HTML FILE
     * -----------------------------------------------------
     */

    const outputFile =
        path.join(productDir, "index.html")

    /**
     * -----------------------------------------------------
     * WRITE FILE
     * -----------------------------------------------------
     */

    await fs.writeFile(
        outputFile,
        html,
        "utf-8"
    )

    /**
     * -----------------------------------------------------
     * SUCCESS LOG
     * -----------------------------------------------------
     */

    console.log(
        `✅ Product page generated: ${outputFile}`
    )

    /**
     * -----------------------------------------------------
     * RETURN OUTPUT PATH
     * -----------------------------------------------------
     */

    return outputFile
}

/**
 * =========================================================
 * SANITIZE PATH SEGMENT
 * =========================================================
 *
 * Prevents:
 * - invalid filesystem chars
 * - accidental slashes
 * - malformed folders
 *
 * =========================================================
 */

function sanitizePathSegment(
    value: string
): string {

    return value
        .trim()
        .toLowerCase()

        /**
         * Remove invalid path characters
         */
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")

        /**
         * Replace spaces
         */
        .replace(/\s+/g, "-")

        /**
         * Collapse duplicate dashes
         */
        .replace(/-+/g, "-")
}