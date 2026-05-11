import { renderProducts } from "@render/renderProducts"

import { filterProductsByCategory } from "@/data/productCategories"

import { mapProductCard } from "@/lib/sanity/mappers"

import type { SanityProductCard, RawSanityCategory } from "@/data/types/rawSanityData"

import { type ProductFilter } from "@/data/productCategories"

/**
 * =========================================================
 * RENDER PRODUCT FILTER BAR
 * =========================================================
 */

export function renderProductFilters(

    container: HTMLElement,

    filters: ProductFilter[],

    productsGrid: HTMLElement,

    products: SanityProductCard[],

    categories: RawSanityCategory[]

): void {

    /**
     * -----------------------------------------------------
     * SAFETY GUARDS
     * -----------------------------------------------------
     */

    if (!container) {

        console.warn(
            "[ProductFilters] Missing filter container."
        )

        return

    }

    if (!productsGrid) {

        console.warn(
            "[ProductFilters] Missing products grid."
        )

        return

    }


    /**
     * -----------------------------------------------------
     * CLEAR FILTERS
     * -----------------------------------------------------
     */

    container.innerHTML = ""


    /**
     * -----------------------------------------------------
     * ALL FILTER
     * -----------------------------------------------------
     */

    const allFilters: ProductFilter[] = [

        {
            label: "All",
            slug: "all"
        },

        ...filters

    ]

    /**
     * -----------------------------------------------------
     * RENDER BUTTONS
     * -----------------------------------------------------
     */

    for (const filter of allFilters) {

        const button =
            document.createElement("button")

        /**
         * -------------------------------------------------
         * ATTRIBUTES
         * -------------------------------------------------
         */

        button.type = "button"

        button.textContent =
            filter.label

        /**
         * -------------------------------------------------
         * STYLES
         * -------------------------------------------------
         */

        button.className = `
            filter-btn
            px-5
            py-2
            rounded-full
            border
            border-border
            text-body-sm
            transition
        `

        /**
         * -------------------------------------------------
         * DEFAULT ACTIVE
         * -------------------------------------------------
         */

        if (filter.slug === "all") {

            button.classList.add(
                "is-active"
            )

        }

        /**
         * -------------------------------------------------
         * CLICK EVENT
         * -------------------------------------------------
         */

        button.addEventListener(
            "click",
            () => {

                /**
                 * Remove active states
                 */

                container
                    .querySelectorAll(".filter-btn")
                    .forEach(btn =>

                        btn.classList.remove(
                            "is-active"
                        )

                    )

                /**
                 * Activate current
                 */

                button.classList.add(
                    "is-active"
                )

                /**
                 * Filter products
                 */

                const filteredProducts =

                    filter.slug === "all"

                        ? products

                        : filterProductsByCategory(

                            products,
                            categories,
                            filter.slug

                        )

                /**
                 * Map products
                 */

                const mappedProducts =
                    filteredProducts.map(product =>

                        mapProductCard(
                            product,
                            categories
                        )

                    )

                /**
                 * Render products
                 */

                renderProducts(
                    mappedProducts,
                    productsGrid
                )

            }

        )

        /**
         * Append button
         */

        container.appendChild(button)

    }

}