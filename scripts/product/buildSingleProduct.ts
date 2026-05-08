/**
 * =========================================================
 * BUILD SINGLE PRODUCT
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * End-to-end static product page generation pipeline.
 *
 * This file:
 * - Fetches product data from Sanity
 * - Fetches category hierarchy data
 * - Maps raw CMS data into normalized app data
 * - Generates final HTML
 * - Writes final HTML page to filesystem
 *
 * OUTPUT EXAMPLE
 * ---------------------------------------------------------
 * /products/vinegars/apple-cider-vinegar/index.html
 *
 * ARCHITECTURE FLOW
 * ---------------------------------------------------------
 * Sanity CMS
 *      ↓
 * fetchSanity()
 *      ↓
 * mapProductDetail()
 *      ↓
 * generateProductHTML()
 *      ↓
 * generateProductPage()
 *
 * =========================================================
 */

import { fetchBuildSanity }  from "@scripts/build/sanity/fetchBuildSanity"

import {
    PRODUCT_DETAIL_QUERY
} from "@/lib/sanity/queries"

import { mapProductDetail } from "@/lib/sanity/mappers"

import { generateProductHTML }
    from "../product/generateProductHTML"

import { generateProductPage }
    from "../product/generateProductPage"

import type {
    RawSanityCategory,
    SanityProductDetail
} from "@/data/types/rawSanityData"

/**
 * =========================================================
 * BUILD SINGLE PRODUCT
 * =========================================================
 *
 * @param slug
 * Product slug from Sanity
 *
 * Example:
 * apple-cider-vinegar
 *
 * =========================================================
 */

export async function buildSingleProduct(
    slug: string,
    allCategories: RawSanityCategory[]
): Promise<string | null> {

    /**
     * -----------------------------------------------------
     * VALIDATION
     * -----------------------------------------------------
     */

    if (!slug?.trim()) {

        console.error(
            `[BuildSingleProduct] Invalid slug provided`
        )

        return null
    }

    try {

        /**
         * -------------------------------------------------
         * FETCH RAW PRODUCT
         * -------------------------------------------------
         */

        const raw =
            await fetchBuildSanity<SanityProductDetail>(
                PRODUCT_DETAIL_QUERY,
                { slug }
            )

        /**
         * Product not found
         */

        if (!raw) {

            console.warn(
                `[BuildSingleProduct] Product not found: ${slug}`
            )

            return null
        }

       

        /**
         * -------------------------------------------------
         * MAP PRODUCT
         * -------------------------------------------------
         *
         * Converts raw Sanity data into:
         * - normalized structure
         * - resolved hierarchy
         * - canonical URL path
         */

        const product =
            mapProductDetail(
                raw,
                allCategories
            )

        /**
         * -------------------------------------------------
         * GENERATE FINAL HTML
         * -------------------------------------------------
         */

        const html =
            await generateProductHTML(product)

        /**
         * Safety check
         */

        if (!html?.trim()) {

            console.error(
                `[BuildSingleProduct] HTML generation failed for: ${slug}`
            )

            return null
        }

        /**
         * -------------------------------------------------
         * WRITE FINAL PAGE
         * -------------------------------------------------
         */

        const outputPath =
            await generateProductPage({
                html,
                product
            })

        /**
         * -------------------------------------------------
         * SUCCESS
         * -------------------------------------------------
         */

        console.log(
            `✅ Built product page: ${product.title}`
        )

        console.log(
            `📄 Output: ${outputPath}`
        )

        return outputPath

    } catch (error) {

        /**
         * -------------------------------------------------
         * ERROR HANDLING
         * -------------------------------------------------
         */

        console.error(
            `[BuildSingleProduct] Failed to build product: ${slug}`,
            error
        )

        return null
    }
}