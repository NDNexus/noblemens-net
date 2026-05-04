import { fetchSanity } from "@/lib/sanity/fetch"
import { PRODUCT_DETAIL_QUERY } from "@/lib/sanity/queries"
import { renderFAQs } from "./renderFAQs"
import { portableTextToHTML } from "./portableTextRenderer"
import { createWhatsAppLink } from "@/lib/utils/whatsapp"

import { renderTestimonials } from "@components/testimonialCarousel"

import type { SanityProductDetail } from "@/data/types/rawSanityData"
import { mapProductDetail } from "@/lib/sanity/mappers"
import type {
    ProductDetail,
    ProductDetailVariant
} from "@/data/types/productDetail"

// -------------------------------
// GET SLUG FROM URL
// -------------------------------
function getSlugFromURL(): string | null {
    const path = window.location.pathname

    console.log("[DEBUG] PATH:", path)

    const parts = path.split("/").filter(Boolean)

    console.log("[DEBUG] PARTS:", parts)

    const slug = parts.length ? parts[parts.length - 1] : null

    console.log("[DEBUG] SLUG:", slug)

    return slug
}

/**
 * =========================================================
 * GET SELECTED VARIANT (with persistence)
 * =========================================================
 *
 * Priority:
 * 1. Saved in localStorage
 * 2. Default variant
 * 3. First variant fallback
 */

/**
 * =========================================================
 * GET SELECTED VARIANT (URL + localStorage aware)
 * =========================================================
 *
 * Priority:
 * 1. URL param (source of truth)
 * 2. localStorage (fallback)
 * 3. default variant
 */

function getSelectedVariant(product: ProductDetail): ProductDetailVariant {
    const storageKey = `variant-${product.slug}`

    const params = new URLSearchParams(window.location.search)
    const urlVariantKey = params.get("variant")

    // -------------------------------
    // 1. URL PARAM (HIGHEST PRIORITY)
    // -------------------------------
    if (urlVariantKey) {
        const match = product.variants.find(v => v.key === urlVariantKey)

        if (match) {
            // Sync localStorage with URL
            localStorage.setItem(storageKey, match.key)
            return match
        }
    }

    // -------------------------------
    // 2. LOCAL STORAGE
    // -------------------------------
    const savedKey = localStorage.getItem(storageKey)

    if (savedKey) {
        const match = product.variants.find(v => v.key === savedKey)
        if (match) return match
    }

    // -------------------------------
    // 3. DEFAULT
    // -------------------------------
    return product.defaultVariant || product.variants[0]
}

/**
 * Helper function to get proper embed URL for IFrame
 * @param url 
 * @returns 
 */
function getYouTubeEmbedUrl(url: string): string | null {
    try {
        const parsed = new URL(url)

        // youtu.be short link
        if (parsed.hostname.includes("youtu.be")) {
            const id = parsed.pathname.slice(1)
            return `https://www.youtube-nocookie.com/embed/${id}?controls=1&modestbranding=1&rel=0&playsinline=1`
        }

        // youtube.com watch link
        if (parsed.hostname.includes("youtube.com")) {
            const id = parsed.searchParams.get("v")
            if (!id) return null

            return `https://www.youtube-nocookie.com/embed/${id}?controls=1&modestbranding=1&rel=0&playsinline=1`
        }

        return null
    } catch {
        return null
    }
}

// -------------------------------
// MAIN RENDER FUNCTION
// -------------------------------
export async function renderSingleProduct() {
    const slug = getSlugFromURL()

    if (!slug) {
        console.error("[Product] Slug not found")
        return
    }

    const raw = await fetchSanity<SanityProductDetail>(
        PRODUCT_DETAIL_QUERY,
        { slug }
    )

    const product = mapProductDetail(raw)

    console.log("[Product Loaded]", product)

    if (!product) return

    renderTestimonials(product.testimonials)

    const variant = getSelectedVariant(product)

    // ✅ Initialize UI with selected variant
    updateProductUI(product, variant)

    // ✅ Render variant cards
    renderVariantCards(product, variant)

    // -------------------------------
    // TITLE
    // -------------------------------
    const titleEl = document.querySelector<HTMLHeadingElement>("h1")
    if (titleEl) titleEl.textContent = product.title

    // -------------------------------
    // SHORT DESCRIPTION
    // -------------------------------
    const descEl = document.querySelector("#product-short-description p")
    if (descEl) descEl.textContent = product.shortDescription

    // -------------------------------
    // MAIN IMAGE
    // -------------------------------
    const mainImage = document.getElementById("main-image") as HTMLImageElement
    if (mainImage && variant.images?.length) {
        mainImage.src = variant.images[0] // Set the 1st variant image as main image
    }

    // -------------------------------
    // PRICE (you can add element later)
    // -------------------------------
    const priceEl = document.querySelector<HTMLElement>(".product-price")

    if (priceEl) {
        const currentPrice = `₹${variant.price}`

        if (
            variant.compareAtPrice &&
            variant.compareAtPrice > variant.price
        ) {
            const comparePrice = `₹${variant.compareAtPrice}`

            priceEl.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-heading-lg font-semibold">
          ${currentPrice}
        </span>
        <span class="text-muted line-through text-body-sm opacity-70">
          ${comparePrice}
        </span>
      </div>
    `
        } else {
            priceEl.innerHTML = `
      <div class="flex items-center">
        <span class="text-heading-lg font-semibold">
          ${currentPrice}
        </span>
      </div>
    `
        }
    }

    // -------------------------------
    // WHATSAPP LINK
    // -------------------------------
    const orderBtn = document.getElementById("order-button") as HTMLAnchorElement
    if (orderBtn) {
        orderBtn.href = createWhatsAppLink({
            title: product.title,
            link: window.location.href,
            price: variant.price
        })
    }

    // -------------------------------
    // KEY HIGHLIGHTS
    // -------------------------------
    const highlightsList = document.getElementById("product-hilights-list")
    if (highlightsList && product.keyHighlights?.length) {
        highlightsList.innerHTML = ""

        product.keyHighlights.forEach((item: string) => {
            const li = document.createElement("li")
            li.textContent = item
            highlightsList.appendChild(li)
        })
    }

    // -------------------------------
    // ABOUT PRODUCT SECTION (TITLE)
    // -------------------------------
    const heading = document.getElementById("product-main-content-heading")

    if (heading && product.title) {
        heading.textContent = `About ${product.title}`
    }


    // -------------------------------
    // FULL DESCRIPTION (rich + callout)
    // -------------------------------
    const fullDesc = document.getElementById("product-full-description")

    if (fullDesc && product.description) {

        const html = portableTextToHTML(product.description)

        if (!html.trim()) {
            fullDesc.style.display = "none"
        } else {
            fullDesc.innerHTML = html
        }
    }

    // -------------------------------
    // How To Use - Callout
    // -------------------------------
    const howToUseBox = document.getElementById("how-to-use-box")

    if (howToUseBox && product.howToUse) {

        const html = portableTextToHTML(product.howToUse)

        if (!html.trim()) {
            howToUseBox.style.display = "none"
        } else {
            const content = howToUseBox.querySelector(".callout__content")

            if (content) {
                content.innerHTML += html
            }
        }
    }

    // -------------------------------
    // Product Video
    // -------------------------------
    const videoFrame = document.getElementById("product-video") as HTMLIFrameElement | null
    const videoFrameParent = document.getElementById("key-product-highlights-video-container") as HTMLElement | null

    if (videoFrame) {
        if (product.videoUrl) {
            const embedUrl = getYouTubeEmbedUrl(product.videoUrl)

            if (embedUrl) {
                videoFrame.src = embedUrl
                videoFrame.style.display = "block"
            } else {
                console.warn("[Product] Invalid video URL:", product.videoUrl)
                videoFrame.style.display = "none"
            }
        } else {
            // No video → hide container
            videoFrame.style.display = "none"

            if (!videoFrameParent) return
            videoFrameParent.style.display = "none" // Hide the parent container of the video IFrame as well.

        }
    }

    // -------------------------------
    // FAQ
    // -------------------------------
    if (product.faqs?.length) {
        renderFAQs(product.faqs)
    }

    renderVariantCards(product, variant)
}

/**
 * =========================================================
 * INIT PRODUCT PAGE
 * =========================================================
 *
 * - Runs only on valid product detail pages
 * - Ensures DOM is ready
 * - Handles errors safely
 */

export function initProductPage(): void {
    const path = window.location.pathname

    // -------------------------------
    // ROUTE CHECK
    // -------------------------------
    // Matches: /products/category/slug
    const isProductPage =
        path.startsWith("/products/") && path.split("/").length > 2

    if (!isProductPage) return

    // -------------------------------
    // DOM READY CHECK
    // -------------------------------
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", run)
    } else {
        run()
    }

    // -------------------------------
    // MAIN EXECUTION
    // -------------------------------
    function run() {
        try {
            renderSingleProduct()
        } catch (error) {
            console.error("[ProductPage] Failed to render product:", error)
        }
    }
}

/**
 * =========================================================
 * RENDER VARIANT CARDS
 * =========================================================
 *
 * - Renders all product variants
 * - Handles selection state
 * - Updates UI on click
 */

function renderVariantCards(
    product: ProductDetail,
    selectedVariant: ProductDetailVariant
) {
    const container = document.getElementById("variant-cards-container")

    if (!container) {
        console.warn("[Variants] Container not found")
        return
    }

    if (!product.variants?.length) {
        console.warn("[Variants] No variants available")
        container.innerHTML = ""
        return
    }

    // Clear existing
    container.innerHTML = ""

    product.variants.forEach((variant) => {
        try {
            // -------------------------------
            // CREATE CARD
            // -------------------------------
            const btn = document.createElement("button")
            btn.className = "card card-variant"
            btn.type = "button"

            // Active state
            if (variant.key === selectedVariant.key) {
                btn.classList.add("active")
            }

            // -------------------------------
            // MEDIA
            // -------------------------------
            const media = document.createElement("div")
            media.className = "card__media"

            const img = document.createElement("img")
            img.src =
                variant.image || "/images/placeholders/product-placeholder.webp"
            img.alt = `${product.title} ${variant.label}`
            img.className = "w-full h-full object-contain"

            media.appendChild(img)

            // -------------------------------
            // BODY
            // -------------------------------
            const body = document.createElement("div")
            body.className = "card__body"

            const label = document.createElement("p")
            label.className = "text-body-sm"
            label.textContent = variant.label

            body.appendChild(label)

            // -------------------------------
            // FOOTER (optional later)
            // -------------------------------
            const footer = document.createElement("div")
            footer.className = "card__footer"

            // -------------------------------
            // APPEND
            // -------------------------------
            btn.appendChild(media)
            btn.appendChild(body)
            btn.appendChild(footer)

            container.appendChild(btn)

            // -------------------------------
            // CLICK HANDLER
            // -------------------------------
            btn.addEventListener("click", () => {
                try {
                    updateProductUI(product, variant)

                    // Save selected variant (persist on refresh)
                    const storageKey = `variant-${product.slug}`
                    localStorage.setItem(storageKey, variant.key)

                    // Update URL without reload (sync state)
                    const url = new URL(window.location.href)
                    url.searchParams.set("variant", variant.key)
                    window.history.replaceState({}, "", url.toString())

                    // Update active state
                    container.querySelectorAll(".card-variant").forEach((el) =>
                        el.classList.remove("active")
                    )
                    btn.classList.add("active")

                } catch (error) {
                    console.error("[Variants] Failed to update UI:", error)
                }
            })
        } catch (error) {
            console.error("[Variants] Failed to render variant:", variant, error)
        }
    })
}

/**
 * =========================================================
 * UPDATE PRODUCT UI ON VARIANT CHANGE
 * =========================================================
 */

function updateProductUI(
    product: ProductDetail,
    variant: ProductDetailVariant
) {
    // -------------------------------
    // IMAGE (main)
    // -------------------------------
    const mainImage = document.getElementById(
        "main-image"
    ) as HTMLImageElement | null

    if (mainImage && variant.images?.length) {
        mainImage.src = variant.images[0]
    }

    // -------------------------------
    // GALLERY THUMBNAILS
    // -------------------------------
    const thumbsContainer = document.getElementById(
        "product-gallery-thumbnails"
    )

    if (thumbsContainer) {
        thumbsContainer.innerHTML = ""

        variant.images.forEach((imgUrl, index) => {
            const thumb = document.createElement("img")
            thumb.src = imgUrl
            thumb.className =
                "thumbnail rounded-xs cursor-pointer border border-border-subtle"

            if (index === 0) {
                thumb.classList.add("active")
            }

            thumb.addEventListener("click", () => {
                if (mainImage) mainImage.src = imgUrl

                thumbsContainer
                    .querySelectorAll(".thumbnail")
                    .forEach((el) => el.classList.remove("active"))

                thumb.classList.add("active")
            })

            thumbsContainer.appendChild(thumb)
        })
    }

    // -------------------------------
    // RESET ZOOM (important)
    // -------------------------------
    const zoomContainer = document.getElementById("zoom-container")

    if (zoomContainer) {
        zoomContainer.classList.remove("zoom-active")

        if (mainImage) {
            mainImage.style.transformOrigin = "50% 50%"
        }
    }

    // -------------------------------
    // PRICE
    // -------------------------------
    const priceEl = document.querySelector<HTMLElement>(".product-price")

    if (priceEl) {
        const currentPrice = `₹${variant.price}`

        if (
            variant.compareAtPrice &&
            variant.compareAtPrice > variant.price
        ) {
            const comparePrice = `₹${variant.compareAtPrice}`

            priceEl.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-heading-lg font-semibold">
          ${currentPrice}
        </span>
        <span class="text-muted line-through text-body-sm opacity-70">
          ${comparePrice}
        </span>
      </div>
    `
        } else {
            priceEl.innerHTML = `
      <div class="flex items-center">
        <span class="text-heading-lg font-semibold">
          ${currentPrice}
        </span>
      </div>
    `
        }
    }

    // -------------------------------
    // WHATSAPP LINK
    // -------------------------------
    const orderBtn = document.querySelector(
        ".btn-primary"
    ) as HTMLAnchorElement | null

    if (orderBtn) {
        orderBtn.href = createWhatsAppLink({
            title: product.title,
            link: window.location.href,
            price: variant.price,
        })
    }

    // -------------------------------
    // (NEXT STEP)
    // Gallery + zoom reset later
    // -------------------------------
}