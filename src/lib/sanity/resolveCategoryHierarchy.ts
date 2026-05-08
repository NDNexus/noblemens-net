/**
 * =========================================================
 * RESOLVE CATEGORY HIERARCHY
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Resolves a FULL hierarchical category path from a flat
 * list of Sanity category documents.
 *
 * EXAMPLE
 * ---------------------------------------------------------
 * Input:
 *   categoryId = "abc123"
 *
 * Output:
 * [
 *   "products",
 *   "vinegars",
 *   "raw-vinegars"
 * ]
 *
 * Used for:
 * ---------------------------------------------------------
 * - Product URLs
 * - Breadcrumbs
 * - SEO
 * - Sitemap generation
 * - Category navigation
 *
 * =========================================================
 */

import type {
    RawSanityCategory
} from "@/data/types/rawSanityData"

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

type CategoryMap =
    Map<string, RawSanityCategory>

/**
 * =========================================================
 * RESOLVE CATEGORY HIERARCHY
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

    if (!categoryId || !categories?.length) {
        return ["products"]
    }

    /**
     * -----------------------------------------------------
     * BUILD LOOKUP MAP
     * -----------------------------------------------------
     */

    const categoryMap: CategoryMap =
        new Map()

    for (const category of categories) {

        if (!category?._id) continue

        categoryMap.set(category._id, category)
    }

    /**
     * -----------------------------------------------------
     * RESOLVE HIERARCHY
     * -----------------------------------------------------
     */

    const hierarchy: string[] = []

    /**
     * Prevent circular category loops
     */

    const visited = new Set<string>()

    let currentId: string | undefined =
        categoryId

    while (currentId) {

        /**
         * Prevent infinite recursion
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

        if (!category) {

            console.warn(
                `[CategoryHierarchy] Missing category: ${currentId}`
            )

            break
        }

        /**
         * Add category slug
         */

        if (category.slug) {
            hierarchy.unshift(category.slug)
        }

        /**
         * Move upward
         */

        currentId =
            category.parent || undefined
    }

    /**
     * -----------------------------------------------------
     * ENSURE ROOT SEGMENT
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