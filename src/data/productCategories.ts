/**
 * =========================================================
 * PRODUCT CATEGORIES DOMAIN
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Centralized product category logic for:
 *
 * - Category hierarchy resolution
 * - Product filtering
 * - Dynamic product filters
 *
 * WHY THIS FILE EXISTS
 * ---------------------------------------------------------
 * Keeps ALL category-related business logic
 * in ONE predictable location.
 *
 * This avoids:
 * - scattered filtering logic
 * - duplicated hierarchy code
 * - inconsistent category handling
 *
 * =========================================================
 */

import type {

    RawSanityCategory,
    SanityProductCard

} from "@/data/types/rawSanityData"


/**
 * =========================================================
 * PRODUCT FILTER TYPE
 * =========================================================
 *
 * Used by:
 * - Product filter bar
 * - Archive filtering UI
 *
 * Example:
 * {
 *   label: "Vinegars",
 *   slug: "vinegars"
 * }
 *
 * =========================================================
 */

export type ProductFilter = {

    label: string

    slug: string

}


/**
 * =========================================================
 * CATEGORY LOOKUP MAP TYPE
 * =========================================================
 *
 * Used internally for fast category lookup.
 *
 * Key:
 * - category _id
 *
 * Value:
 * - full category object
 *
 * =========================================================
 */

type CategoryMap =
    Map<string, RawSanityCategory>


/**
 * =========================================================
 * RESOLVE CATEGORY HIERARCHY
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Resolves FULL category hierarchy path
 * from flat category data.
 *
 * EXAMPLE
 * ---------------------------------------------------------
 *
 * Input:
 * categoryId = "abc123"
 *
 * Output:
 * [
 *   "products",
 *   "vinegars",
 *   "raw-vinegars"
 * ]
 *
 * USED FOR
 * ---------------------------------------------------------
 * - Product filtering
 * - Product URLs
 * - Breadcrumbs
 * - SEO paths
 * - Category navigation
 *
 * =========================================================
 */

export function resolveCategoryHierarchy(

    categoryId: string | undefined,

    categories: RawSanityCategory[]

): string[] {

    /**
     * -----------------------------------------------------
     * SAFETY GUARD
     * -----------------------------------------------------
     */

    if (!categoryId || !categories.length) {

        return ["products"]

    }


    /**
     * -----------------------------------------------------
     * BUILD CATEGORY LOOKUP MAP
     * -----------------------------------------------------
     *
     * Converts:
     * [
     *   category,
     *   category
     * ]
     *
     * into:
     *
     * Map(id => category)
     *
     * for fast lookup.
     *
     * -----------------------------------------------------
     */

    const categoryMap: CategoryMap =
        new Map()

    for (const category of categories) {

        /**
         * Skip invalid categories
         */

        if (!category?._id) continue

        categoryMap.set(
            category._id,
            category
        )

    }


    /**
     * -----------------------------------------------------
     * RESOLVE HIERARCHY
     * -----------------------------------------------------
     */

    const hierarchy: string[] = []

    /**
     * Prevent circular loops
     */

    const visited =
        new Set<string>()

    /**
     * Current category ID while traversing upward
     */

    let currentId: string | undefined =
        categoryId


    /**
     * -----------------------------------------------------
     * WALK UP CATEGORY TREE
     * -----------------------------------------------------
     */

    while (currentId) {

        /**
         * Prevent infinite loops
         */

        if (visited.has(currentId)) {

            console.warn(
                `[CategoryHierarchy] Circular reference detected: ${currentId}`
            )

            break

        }

        visited.add(currentId)


        /**
         * Get current category
         */

        const category =
            categoryMap.get(currentId)


        /**
         * Missing category
         */

        if (!category) {

            console.warn(
                `[CategoryHierarchy] Missing category: ${currentId}`
            )

            break

        }


        /**
         * Add slug to hierarchy
         */

        if (category.slug) {

            hierarchy.unshift(
                category.slug
            )

        }


        /**
         * Move upward to parent
         */

        currentId =
            category.parent || undefined

    }


    /**
     * -----------------------------------------------------
     * ENSURE ROOT SEGMENT
     * -----------------------------------------------------
     *
     * Always ensure:
     *
     * products/...
     *
     * exists.
     *
     * -----------------------------------------------------
     */

    if (hierarchy[0] !== "products") {

        hierarchy.unshift("products")

    }


    /**
     * -----------------------------------------------------
     * FINAL OUTPUT
     * -----------------------------------------------------
     */

    return hierarchy

}


/**
 * =========================================================
 * FILTER PRODUCTS BY CATEGORY
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Filters products using FULL category hierarchy.
 *
 * IMPORTANT
 * ---------------------------------------------------------
 * This supports nested category filtering.
 *
 * Example:
 *
 * products
 * └── vinegars
 *     └── raw-vinegars
 *
 * Filtering by:
 * "vinegars"
 *
 * will ALSO include:
 * "raw-vinegars"
 *
 * =========================================================
 */

export function filterProductsByCategory(

    products: SanityProductCard[],

    categories: RawSanityCategory[],

    targetCategory: string

): SanityProductCard[] {

    /**
     * -----------------------------------------------------
     * FILTER PRODUCTS
     * -----------------------------------------------------
     */

    return products.filter(product => {

        /**
         * Resolve full hierarchy
         */

        const hierarchy =
            resolveCategoryHierarchy(
                product.category?._id,
                categories
            )

        /**
         * Match target category anywhere
         * in hierarchy path.
         */

        return hierarchy.includes(
            targetCategory
        )

    })

}


/**
 * =========================================================
 * GET PRODUCT FILTERS
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Dynamically generates top-level product filters
 * from actual product categories.
 *
 * EXAMPLE OUTPUT
 * ---------------------------------------------------------
 *
 * [
 *   {
 *     label: "Vinegars",
 *     slug: "vinegars"
 *   },
 *
 *   {
 *     label: "Perfumes",
 *     slug: "perfumes"
 *   }
 * ]
 *
 * =========================================================
 */

export function getProductFilters(

    products: SanityProductCard[],

    categories: RawSanityCategory[]

): ProductFilter[] {

    /**
     * -----------------------------------------------------
     * UNIQUE FILTER STORAGE
     * -----------------------------------------------------
     */

    const filtersMap:
        Map<string, ProductFilter> =
        new Map()


    /**
     * -----------------------------------------------------
     * LOOP PRODUCTS
     * -----------------------------------------------------
     */

    for (const product of products) {

        /**
         * Resolve category hierarchy
         */

        const hierarchy =
            resolveCategoryHierarchy(
                product.category?._id,
                categories
            )


        /**
         * -------------------------------------------------
         * GET TOP-LEVEL CATEGORY
         * -------------------------------------------------
         *
         * Example:
         *
         * [
         *   "products",
         *   "vinegars",
         *   "raw-vinegars"
         * ]
         *
         * We want:
         * "vinegars"
         *
         * -------------------------------------------------
         */

        const topLevelCategory: string | undefined =
            hierarchy[1]


        /**
         * Skip invalid category
         */

        if (!topLevelCategory) continue


        /**
         * -------------------------------------------------
         * FIND CATEGORY DOCUMENT
         * -------------------------------------------------
         */

        const category =
            categories.find(cat =>

                cat.slug === topLevelCategory

            )


        /**
         * Skip missing category
         */

        if (!category) continue


        /**
         * -------------------------------------------------
         * ADD UNIQUE FILTER
         * -------------------------------------------------
         */

        filtersMap.set(

            topLevelCategory,

            {

                slug: topLevelCategory,

                label:
                    category.title ||
                    topLevelCategory

            }

        )

    }


    /**
     * -----------------------------------------------------
     * RETURN FILTERS
     * -----------------------------------------------------
     */

    return Array.from(
        filtersMap.values()
    )

}