import { fetchSanity } from "@/lib/sanity/fetch"
import { PRODUCT_CARDS_QUERY, ALL_CATEGORIES_QUERY } from "@/lib/sanity/queries"

import { mapProductCard, getMeta, buildVariantLink } from "@/lib/sanity/mappers"

import { createWhatsAppLink } from "@lib/utils/whatsapp"

import type { SanityProductCard } from "@/data/types/rawSanityData"
import type { CategoryNode } from "@/data/types/category"
import type { ProductCard } from "@/data/types/product"

export async function renderProducts(container: HTMLElement) {
    try {
        // -------------------------------
        // FETCH DATA
        // -------------------------------
        const [products, categories] = await Promise.all([
            fetchSanity<SanityProductCard[]>(PRODUCT_CARDS_QUERY),
            fetchSanity<CategoryNode[]>(ALL_CATEGORIES_QUERY),
        ])

        // -------------------------------
        // MAP DATA
        // -------------------------------
        const mappedProducts = products.map(product =>
            mapProductCard(product, categories)
        )

        // -------------------------------
        // RENDER
        // -------------------------------
        renderProductCards(mappedProducts, container)

    } catch (error) {
        console.error("Failed to render products:", error)
    }
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

function renderProductCards(products: ProductCard[], container: HTMLElement) {
    const template = document.querySelector<HTMLTemplateElement>("#product-card-template")

    if (!template) return

    container.innerHTML = ""

    products.forEach(product => {
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
                priceEl.textContent = `₹${variant.price}`
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
                    link: product.link,
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
