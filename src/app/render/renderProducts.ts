import { fetchSanity } from "@/lib/sanity/fetch"
import { PRODUCT_CARDS_QUERY, ALL_CATEGORIES_QUERY } from "@/lib/sanity/queries"

import { mapProductCard } from "@/lib/sanity/mappers"

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

    const link = node.querySelector(".product-link") as HTMLAnchorElement
    if (link) link.href = product.link

    container.appendChild(node)
  })
}