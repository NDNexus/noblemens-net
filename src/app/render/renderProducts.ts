
import { getMeta, buildVariantLink } from "@/lib/sanity/mappers"

import { createWhatsAppLink } from "@lib/utils/whatsapp"

import type { ProductCard } from "@/data/types/product"


export function renderProducts(

    products: ProductCard[],

    container: HTMLElement,

    limit?: number

): void {

    /**
     * -----------------------------------------------------
     * SAFETY GUARD
     * -----------------------------------------------------
     */

    if (!container) {

        console.warn(
            "[RenderProducts] Missing container."
        )

        return

    }

    /**
     * -----------------------------------------------------
     * RENDER CARDS
     * -----------------------------------------------------
     */

    renderProductCards(
        products,
        container,
        limit
    )

}

/**
 * Render Meta in cards properly 
 * @param metaEl 
 * @param meta 
 * @returns 
 */
function renderMeta(metaEl: HTMLElement, meta: string[]) {
    if (!metaEl) return

    // Clear existing
    metaEl.innerHTML = ""

    meta.forEach((item, index) => {
        // Text
        const span = document.createElement("span")
        span.textContent = item
        metaEl.appendChild(span)

        // Separator (except last)
        if (index < meta.length - 1) {
            const separator = document.createElement("span")
            separator.className = "meta-separator"
            metaEl.appendChild(separator)
        }
    })
}

function renderProductCards(products: ProductCard[], container: HTMLElement, limit?: number) {
    const template = document.querySelector<HTMLTemplateElement>("#product-card-template")

    console.log("Card template:", template)

    if (!template)
        return

    container.innerHTML = ""

    console.log(
        "Rendering cards:",
        products.map(p => p.title)
    )

    const productsToRender =

        limit
            ? products.slice(0, limit)
            : products

    productsToRender.forEach(product => {
        const node = template.content.cloneNode(true) as HTMLElement

        const img = node.querySelector("img")
        if (img) {
            img.src = product.image
            img.alt = product.alt
        }

        const title = node.querySelector(".product-title")
        if (title) title.textContent = product.title

        const desc = node.querySelector(".product-description")
        if (desc) desc.textContent = product.description

        /**
         * -------------------------------------------------------
         * PRICE
         * -------------------------------------------------------
         */
        const priceContainer =
            node.querySelector(".product-price")

        if (priceContainer) {

            const currentPrice =
                product.price.current.toLocaleString("en-IN")

            const compareAtPrice =
                product.price.compareAt

            /**
             * Premium pricing markup
             */

            priceContainer.innerHTML = compareAtPrice &&
                compareAtPrice > product.price.current

                ? `
            <div class="flex items-center gap-3 flex-wrap">

                <span class="text-heading-md text-text-primary font-serif font-semibold">
                    ₹${currentPrice}
                </span>

                <span class="text-body-sm text-muted line-through">
                    ₹${compareAtPrice.toLocaleString("en-IN")}
                </span>

                <span
                    class="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-1 text-[0.72rem] font-medium uppercase tracking-[0.08em] text-accent">
                    Offer
                </span>

            </div>
        `

                : `
            <div class="flex items-center">

                <span class="text-heading-md text-text-primary font-serif font-semibold">
                    ₹${currentPrice}
                </span>

            </div>
        `
        }

        // -------------------------------
        // META (default variant)
        // -------------------------------
        const metaEl = node.querySelector<HTMLElement>(".product-meta")

        if (metaEl) {
            renderMeta(metaEl, product.meta || [])
        }

        const link = node.querySelector(".product-link") as HTMLAnchorElement
        if (link) link.href = product.link

        const orderLink = node.querySelector(".product-order-link") as HTMLAnchorElement
        if (orderLink) orderLink.href = product.orderLink

        // -------------------------------
        // 🔥 VARIANT PILLS (RENDER)
        // -------------------------------
        const pillsContainer = node.querySelector(".card__variants")

        if (pillsContainer) {
            pillsContainer.innerHTML = ""

            product.variants.forEach((variant) => {
                const pill = document.createElement("button")
                pill.textContent = variant.label
                pill.className = "variant-pill"

                if (variant.isDefault) {
                    pill.classList.add("active")
                }

                pillsContainer.appendChild(pill)
            })
        }

        // -------------------------------
        // 🔥 ATTACH INTERACTION
        // -------------------------------
        attachVariantHandlers(node, product)

        container.appendChild(node)
    })
}

function attachVariantHandlers(
    node: HTMLElement,
    product: ProductCard
) {
    const pills = node.querySelectorAll(".variant-pill")

    const img = node.querySelector("img") as HTMLImageElement
    const priceEl = node.querySelector(".product-price")
    const metaEl = node.querySelector<HTMLElement>(".product-meta")
    const linkEl = node.querySelector<HTMLAnchorElement>(".product-link")
    const orderLink = node.querySelector(".product-order-link") as HTMLAnchorElement

    pills.forEach((pill, index) => {
        pill.addEventListener("click", () => {
            const variant = product.variants[index]

            if (!variant) return

            // -----------------------
            // UPDATE IMAGE
            // -----------------------
            if (img) {
                img.src = variant.image
            }

            // -----------------------
            // UPDATE PRICE
            // -----------------------
            if (priceEl) {
                
                const currentPrice =
                    variant.price.toLocaleString("en-IN")

                const compareAtPrice =
                    variant.compareAt

                /**
                 * Premium pricing markup
                 */

                priceEl.innerHTML = compareAtPrice &&
                    compareAtPrice > product.price.current

                    ? `
            <div class="flex items-center gap-3 flex-wrap">

                <span class="text-heading-md text-text-primary font-serif font-semibold">
                    ₹${currentPrice}
                </span>

                <span class="text-body-sm text-muted line-through">
                    ₹${compareAtPrice.toLocaleString("en-IN")}
                </span>

                <span
                    class="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-1 text-[0.72rem] font-medium uppercase tracking-[0.08em] text-accent">
                    Offer
                </span>

            </div>
        `

                    : `
            <div class="flex items-center">

                <span class="text-heading-md text-text-primary font-serif font-semibold">
                    ₹${currentPrice}
                </span>

            </div>
        `
            }

            // -----------------------
            // META 
            // -----------------------
            if (metaEl) {
                const meta = getMeta(variant, product.productType)
                renderMeta(metaEl, meta)
            }


            // -----------------------
            // BUILD VARIANT LINK
            // -----------------------
            const variantLink = buildVariantLink(product.link, variant.key)

            // -----------------------
            // UPDATE VIEW LINK
            // -----------------------
            if (linkEl) {
                linkEl.href = variantLink
            }

            // -----------------------
            // UPDATE ORDER LINK
            // -----------------------
            if (orderLink) {
                orderLink.href = createWhatsAppLink({
                    title: product.title,
                    urlPath: product.link,
                    price: variant.price
                })
            }

            // -----------------------
            // UPDATE ACTIVE STATE
            // -----------------------
            pills.forEach(p => p.classList.remove("active"))
            pill.classList.add("active")
        })
    })
}
