/**
 * =========================================================
 * GENERATE PRODUCT HTML
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Generates the FINAL HTML string for a single product page.
 *
 * RESPONSIBILITIES
 * ---------------------------------------------------------
 * - Loads HTML template
 * - Renders dynamic sections
 * - Injects placeholders
 * - Returns final HTML string
 *
 * DOES NOT:
 * ---------------------------------------------------------
 * - Fetch CMS data
 * - Write files
 * - Handle filesystem
 *
 * =========================================================
 */

import fs from "fs/promises"
import path from "path"

import type {
    ProductDetail,
    ProductDetailVariant
} from "@/data/types/productDetail"

import { portableTextToHTML } from "@/app/render/portableTextRenderer"

/**
 * =========================================================
 * CONFIG
 * =========================================================
 */

const TEMPLATE_PATH =
    "./templates/product/single-product-details.html"

/**
 * =========================================================
 * CTA CONFIG
 * =========================================================
 *
 * Move later to dedicated config file if needed
 */

const PRODUCT_PAGE_CONFIG = {
    primaryCTA: "Order on WhatsApp",
    secondaryCTA: "Call Now"
}

/**
 * =========================================================
 * MAIN GENERATOR
 * =========================================================
 */

export async function generateProductHTML(
    product: ProductDetail
): Promise<string> {

    /**
     * -----------------------------------------------------
     * LOAD TEMPLATE
     * -----------------------------------------------------
     */

    let template = await fs.readFile(
        path.resolve(TEMPLATE_PATH),
        "utf-8"
    )

    /**
     * -----------------------------------------------------
     * DEFAULT VARIANT
     * -----------------------------------------------------
     */

    const defaultVariant =
        product.defaultVariant ||
        product.variants?.[0]

    if (!defaultVariant) {
        throw new Error(
            `[HTML Generator] Product "${product.title}" has no variants`
        )
    }

    /**
     * -----------------------------------------------------
     * RENDER DYNAMIC SECTIONS
     * -----------------------------------------------------
     */

    const galleryHTML =
        renderGalleryThumbnails(defaultVariant)

    const variantsHTML =
        renderVariantCards(product)

    const highlightsHTML =
        renderHighlights(product.keyHighlights)

    const faqHTML =
        renderFAQs(product.faqs)

    const testimonialHTML =
        renderTestimonials(product.testimonials)

    const descriptionHTML =
        portableTextToHTML(product.description)

    const howToUseHTML =
        portableTextToHTML(product.howToUse)

    const videoEmbedURL =
        extractVideoEmbedURL(product.videoUrl)

    /**
     * -----------------------------------------------------
     * PLACEHOLDER REPLACEMENTS
     * -----------------------------------------------------
     */

    const replacements: Record<string, string> = {

        PRODUCT_TITLE:
            escapeHTML(product.title),

        SHORT_DESCRIPTION:
            product.shortDescription || "",

        PRODUCT_PRICE:
            renderPrice(defaultVariant),

        PRODUCT_META:
            renderMeta(defaultVariant),

        PRODUCT_MAIN_CONTENT_HEADING:
            `About ${escapeHTML(product.title)}`,

        PRODUCT_FULL_DESCRIPTION:
            descriptionHTML,

        HOW_TO_USE_BOX_CONTENT:
            howToUseHTML,

        KEY_PRODUCT_HIGHLIGHTS_SECTION_HEADING:
            "Key Highlights",

        KEY_PRODUCT_HIGHLIGHTS_LIST_CONTENT:
            highlightsHTML,

        FAQ_ITEMS:
            faqHTML,

        VARIANT_CARDS:
            variantsHTML,

        PRIMARY_CTA_BUTTON_TEXT:
            PRODUCT_PAGE_CONFIG.primaryCTA,

        SECONDARY_CTA_BUTTON_TEXT:
            PRODUCT_PAGE_CONFIG.secondaryCTA,
    }

    /**
     * -----------------------------------------------------
     * APPLY REPLACEMENTS
     * -----------------------------------------------------
     */

    for (const [key, value] of Object.entries(replacements)) {

        const regex = new RegExp(
            `{{\\s*${key}\\s*}}`,
            "g"
        )

        template = template.replace(regex, value)
    }

    /**
     * -----------------------------------------------------
     * MAIN IMAGE
     * -----------------------------------------------------
     */

    template = template.replace(
        'src="" class="w-full h-full object-center object-contain cursor-zoom-in"',
        `src="${defaultVariant.image}" class="w-full h-full object-center object-contain cursor-zoom-in"`
    )

    /**
     * -----------------------------------------------------
     * IMAGE ALT
     * -----------------------------------------------------
     */

    template = template.replace(
        'alt=""',
        `alt="${escapeHTML(product.title)}"`
    )

    /**
     * -----------------------------------------------------
     * THUMBNAILS
     * -----------------------------------------------------
     */

    template = template.replace(
        '<div id="product-gallery-thumbnails" class="grid grid-gallery-thumbnails gap-sm">\n\n                    </div>',
        `<div id="product-gallery-thumbnails" class="grid grid-gallery-thumbnails gap-sm">
${galleryHTML}
</div>`
    )

    /**
     * -----------------------------------------------------
     * VIDEO
     * -----------------------------------------------------
     */

    if (videoEmbedURL) {

        template = template.replace(
            'src="" title=""',
            `src="${videoEmbedURL}" title="${escapeHTML(product.title)} Video"`
        )

        template = template.replace(
            'hidden">',
            '">'
        )

    } else {

        template = template.replace(
            /<div id="key-product-highlights-video-container"[\s\S]*?<\/div>/,
            ""
        )
    }

    /**
     * -----------------------------------------------------
     * TESTIMONIALS
     * -----------------------------------------------------
     */

    if (testimonialHTML.trim()) {

        template = template.replace(
            '<div id="testimonials-track"\n                        class="flex gap-6 transition-transform duration-500 ease will-change-transform"></div>',
            `<div id="testimonials-track"
                        class="flex gap-6 transition-transform duration-500 ease will-change-transform">
${testimonialHTML}
</div>`
        )

        template = template.replace(
            'section id="testimonials-section" class="section bg-bg-main hidden"',
            'section id="testimonials-section" class="section bg-bg-main"'
        )
    }

    /**
     * -----------------------------------------------------
     * CLEAN UNUSED PLACEHOLDERS
     * -----------------------------------------------------
     */

    template = template.replace(/{{.*?}}/g, "")

    return template
}

/**
 * =========================================================
 * RENDER GALLERY THUMBNAILS
 * =========================================================
 */

function renderGalleryThumbnails(
    variant: ProductDetailVariant
): string {

    if (!variant.images?.length) return ""

    return variant.images.map((image, index) => `
<img
    src="${image}"
    alt="Thumbnail ${index + 1}"
    class="thumbnail rounded-xs cursor-pointer border border-border-subtle ${index === 0 ? "active" : ""}"
>
`).join("")
}

/**
 * =========================================================
 * RENDER VARIANT CARDS
 * =========================================================
 */

function renderVariantCards(
    product: ProductDetail
): string {

    if (!product.variants?.length) return ""

    return product.variants.map((variant) => {

        const active =
            variant.isDefault
                ? "active"
                : ""

        console.log(
            "[Variant Cards]",
            product.title,
            product.variants
        )

        return `
<button
    class="card card-variant ${active}"
    type="button"
>

    <div class="card__media">
        <img
            src="${variant.image}"
            alt="${escapeHTML(product.title)} ${escapeHTML(variant.label)}"
            class="w-full h-full object-contain"
        >
    </div>

    <div class="card__body">
        <p class="text-body-sm">
            ${escapeHTML(variant.label)}
        </p>
    </div>

</button>
`
    }).join("")
}

/**
 * =========================================================
 * RENDER HIGHLIGHTS
 * =========================================================
 */

function renderHighlights(
    highlights: string[]
): string {

    if (!highlights?.length) return ""

    return highlights.map(item => `
<li>${escapeHTML(item)}</li>
`).join("")
}

/**
 * =========================================================
 * RENDER FAQS
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Generates fully rendered FAQ accordion HTML
 * during static generation.
 *
 * RESPONSIBILITIES
 * ---------------------------------------------------------
 * - Render FAQ items
 * - Apply accordion classes
 * - Apply initial active state
 * - Escape unsafe HTML
 *
 * DOES NOT:
 * ---------------------------------------------------------
 * - Handle accordion interaction
 * - Inject DOM templates
 * - Fetch external templates
 *
 * Frontend JS should ONLY handle:
 * - expand/collapse behavior
 *
 * =========================================================
 */

function renderFAQs(
    faqs: ProductDetail["faqs"]
): string {

    /**
     * -----------------------------------------------------
     * EMPTY STATE
     * -----------------------------------------------------
     */

    if (!faqs?.length) {
        return ""
    }

    /**
     * -----------------------------------------------------
     * RENDER FAQ ITEMS
     * -----------------------------------------------------
     */

    return faqs.map((faq, index) => {

        /**
         * First item expanded by default
         */

        const isActive =
            index === 0

        return `
<div class="faq-item border border-border-subtle rounded-md overflow-hidden ${isActive ? "active" : ""}">

    <!-- FAQ HEADING -->
    <h3 class="faq-heading">

        <button
            class="faq-trigger w-full flex items-center justify-between px-5 py-4 text-left"
            type="button"
            aria-expanded="${isActive ? "true" : "false"}"
        >

            <!-- QUESTION -->
            <span class="faq-question">
                ${escapeHTML(faq.question)}
            </span>

            <!-- ICON -->
            <span class="faq-icon"></span>

        </button>

    </h3>

    <!-- FAQ CONTENT -->
    <div class="faq-content">

        <div class="faq-answer text-muted px-5 pb-5 pt-0">

            ${escapeHTML(faq.answer)}

        </div>

    </div>

</div>
`
    }).join("")
}

/**
 * =========================================================
 * RENDER TESTIMONIALS
 * =========================================================
 */

function renderTestimonials(
    testimonials: ProductDetail["testimonials"]
): string {

    if (!testimonials?.length) return ""

    return testimonials.map((testimonial) => `
<div class="testimonial-card">

    <p class="testimonial-content">
        ${escapeHTML(testimonial.content)}
    </p>

    <div class="testimonial-meta">

        <p class="testimonial-name">
            ${escapeHTML(testimonial.name)}
        </p>

        ${testimonial.subtitle
            ? `<p class="testimonial-subtitle">${escapeHTML(testimonial.subtitle)}</p>`
            : ""
        }

    </div>

</div>
`).join("")
}

/**
 * =========================================================
 * RENDER PRICE
 * =========================================================
 */

function renderPrice(
    variant: ProductDetailVariant
): string {

    const current =
        `₹${variant.price}`

    if (
        variant.compareAtPrice &&
        variant.compareAtPrice > variant.price
    ) {

        return `
<div class="flex items-center gap-2">

    <span class="text-heading-lg font-semibold">
        ${current}
    </span>

    <span class="text-muted line-through text-body-sm opacity-70">
        ₹${variant.compareAtPrice}
    </span>

</div>
`
    }

    return `
<div class="flex items-center">

    <span class="text-heading-lg font-semibold">
        ${current}
    </span>

</div>
`
}

/**
 * =========================================================
 * PRODUCT META
 * =========================================================
 */

function renderMeta(
    variant: ProductDetailVariant
): string {

    /**
     * -----------------------------------------------------
     * Collect all meta values
     * -----------------------------------------------------
     */

    const metaItems: string[] = []

    /**
     * -----------------------------------------------------
     * Variant metadata
     * -----------------------------------------------------
     * Example:
     * - Floral Perfume
     * - Strong
     * - Premium Blend
     */

    if (
        Array.isArray(variant.meta)
    ) {

        variant.meta.forEach((item) => {

            if (
                typeof item === "string" &&
                item.trim()
            ) {

                metaItems.push(
                    escapeHTML(item.trim())
                )


            }
        })
    }

    /**
     * -----------------------------------------------------
     * Variant attributes
     * -----------------------------------------------------
     * Example:
     * - 460 ML
     * - Glass Bottle
     * - With Mother
     */

    if (
        Array.isArray(variant.attributes)
    ) {

        variant.attributes.forEach((attribute) => {

            if (!attribute) return

            const value =
                typeof attribute.value === "string"
                    ? attribute.value.trim()
                    : ""

            if (value) {

                metaItems.push(
                    escapeHTML(value)
                )
            }
        })
    }

    /**
     * -----------------------------------------------------
     * Remove duplicates
     * -----------------------------------------------------
     */

    const uniqueItems =
        [...new Set(metaItems)]

    /**
     * -----------------------------------------------------
     * Empty state
     * -----------------------------------------------------
     */

    if (!uniqueItems.length) {
        return ""
    }

    /**
     * -----------------------------------------------------
     * Build HTML
     * -----------------------------------------------------
     */

    const html =
        uniqueItems
            .map((item, index) => {

                const separator =
                    index < uniqueItems.length - 1
                        ? `<span class="meta-separator"></span>`
                        : ""

                return `
                <span>${item}</span>
                ${separator}
                `
            })
            .join("")

    return html
}

/**
 * =========================================================
 * VIDEO EMBED URL
 * =========================================================
 */

function extractVideoEmbedURL(
    url?: string | null
): string | null {

    if (!url) return null

    try {

        const parsed = new URL(url)

        /**
         * YOUTUBE
         */

        if (parsed.hostname.includes("youtu.be")) {

            const id =
                parsed.pathname.slice(1)

            return `https://www.youtube-nocookie.com/embed/${id}?controls=1&modestbranding=1&rel=0&playsinline=1`
        }

        if (parsed.hostname.includes("youtube.com")) {

            const id =
                parsed.searchParams.get("v")

            if (!id) return null

            return `https://www.youtube-nocookie.com/embed/${id}?controls=1&modestbranding=1&rel=0&playsinline=1`
        }

        /**
         * VIMEO
         */

        if (parsed.hostname.includes("vimeo.com")) {

            const id =
                parsed.pathname.split("/").filter(Boolean)[0]

            return `https://player.vimeo.com/video/${id}`
        }

        return null

    } catch {

        return null
    }
}

/**
 * =========================================================
 * ESCAPE HTML
 * =========================================================
 */

function escapeHTML(value: string): string {

    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
}