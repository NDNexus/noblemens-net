/**
 * =========================================================
 * BUILD ALL PRODUCTS
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Generates static HTML pages for ALL products from Sanity.
 *
 * RESPONSIBILITIES
 * ---------------------------------------------------------
 * - Fetch all product slugs
 * - Validate slug data
 * - Sequentially build each product page
 * - Log success/failure summary
 * - Prevent full pipeline crashes
 *
 * OUTPUT
 * ---------------------------------------------------------
 * /products/.../index.html
 *
 * ARCHITECTURE FLOW
 * ---------------------------------------------------------
 * ALL_PRODUCT_SLUGS_QUERY
 *          ↓
 * buildSingleProduct(slug)
 *          ↓
 * Static HTML output
 *
 * =========================================================
 */

import { fetchBuildSanity } from "@scripts/build/sanity/fetchBuildSanity"

import type {
    RawSanityCategory
} from "@/data/types/rawSanityData"

import {
    ALL_PRODUCT_SLUGS_QUERY,
    ALL_CATEGORIES_QUERY
} from "@/lib/sanity/queries"

import { buildSingleProduct }
    from "@scripts/product/buildSingleProduct"

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

interface ProductSlugResult {
    slug?: string
}

/**
 * =========================================================
 * MAIN BUILD FUNCTION
 * =========================================================
 */

async function buildAllProducts() {

    console.log(
        "\n🚀 Starting product generation pipeline...\n"
    )

    try {

        /**
         * -------------------------------------------------
         * FETCH CATEGORY GRAPH
         * -------------------------------------------------
         *
         * Shared globally across all products.
         */

        const allCategories =
            await fetchBuildSanity<RawSanityCategory[]>(
                ALL_CATEGORIES_QUERY
            )

        if (!allCategories.length) {

            console.warn(
                "⚠️ No categories found in Sanity."
            )

            return
        }

        /**
         * -------------------------------------------------
         * FETCH ALL PRODUCT SLUGS
         * -------------------------------------------------
         */

        const products =
            await fetchBuildSanity<ProductSlugResult[]>(
                ALL_PRODUCT_SLUGS_QUERY
            )

        /**
         * -------------------------------------------------
         * EMPTY SAFETY
         * -------------------------------------------------
         */

        if (!products?.length) {

            console.warn(
                "⚠️ No products found in Sanity."
            )

            return
        }

        /**
         * -------------------------------------------------
         * FILTER VALID SLUGS
         * -------------------------------------------------
         */

        const validProducts =
            products.filter(product =>
                product?.slug?.trim()
            )

        /**
         * -------------------------------------------------
         * VALIDATION
         * -------------------------------------------------
         */

        if (!validProducts.length) {

            console.warn(
                "⚠️ No valid product slugs found."
            )

            return
        }

        /**
         * -------------------------------------------------
         * BUILD STATS
         * -------------------------------------------------
         */

        const total =
            validProducts.length

        let successCount = 0
        let failureCount = 0

        /**
         * -------------------------------------------------
         * BUILD PRODUCTS
         * -------------------------------------------------
         */

        for (const product of validProducts) {

            const slug =
                product.slug as string

            console.log(
                `\n📦 Building product: ${slug}`
            )

            try {

                const result =
                    await buildSingleProduct(slug, allCategories)

                if (result) {

                    successCount++

                    console.log(
                        `✅ Success: ${slug}`
                    )

                } else {

                    failureCount++

                    console.warn(
                        `⚠️ Failed: ${slug}`
                    )
                }

            } catch (error) {

                /**
                 * -----------------------------------------
                 * PER-PRODUCT FAILURE
                 * -----------------------------------------
                 *
                 * Prevent one product from killing
                 * the entire pipeline.
                 */

                failureCount++

                console.error(
                    `❌ Error building product: ${slug}`,
                    error
                )
            }
        }

        /**
         * -------------------------------------------------
         * FINAL SUMMARY
         * -------------------------------------------------
         */

        console.log("\n=================================================")

        console.log("📊 PRODUCT BUILD SUMMARY")

        console.log("-------------------------------------------------")

        console.log(`✅ Successful: ${successCount}`)

        console.log(`❌ Failed: ${failureCount}`)

        console.log(`📦 Total: ${total}`)

        console.log("=================================================\n")

        /**
         * -------------------------------------------------
         * FAIL BUILD IF EVERYTHING FAILED
         * -------------------------------------------------
         */

        if (
            successCount === 0 &&
            total > 0
        ) {

            throw new Error(
                "All product builds failed."
            )
        }

    } catch (error) {

        /**
         * -------------------------------------------------
         * FATAL PIPELINE ERROR
         * -------------------------------------------------
         */

        console.error(
            "\n❌ Product generation pipeline failed.\n",
            error
        )

        process.exit(1)
    }
}

/**
 * =========================================================
 * EXECUTE BUILD
 * =========================================================
 */

buildAllProducts()