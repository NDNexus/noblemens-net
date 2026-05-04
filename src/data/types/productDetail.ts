/**
 * =========================================================
 * PRODUCT DETAIL TYPES (UI MODEL)
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Represents CLEAN, UI-ready product data.
 *
 * IMPORTANT
 * ---------------------------------------------------------
 * - This is NOT raw Sanity data
 * - This is AFTER mapping/normalization
 * - All fields here should be SAFE for rendering
 *
 * =========================================================
 */

import type { SanityPortableText } from '@/data/types/rawSanityData'
 

/* =========================================================
   VARIANT (DETAIL PAGE)
========================================================= */

export interface ProductDetailVariant {
    key: string
    label: string

    // Pricing
    price: number
    compareAtPrice?: number | null

    // Media
    image?: string
    images: string[] // 🔥 REQUIRED for gallery

    // Availability
    inStock: boolean
    isDefault: boolean

    // Product properties
    packaging?: string
    hasMother?: boolean

    // Clean attributes (no showOnCard needed)
    attributes: {
        label: string
        value: string
    }[]
}

// Product Testimonial on product detail page
export interface ProductTestimonial {
    content: string
    name: string
    subtitle?: string
}

/* =========================================================
   PRODUCT DETAIL (FULL PAGE)
========================================================= */
export interface ProductDetail {
    id: string
    title: string
    slug: string

    // 🔥 REQUIRED (used for logic)
    productType: string

    // Rich content
    description: SanityPortableText[]

    // Hero content
    shortDescription: string

    // Media
    images: string[]
    videoUrl?: string | null

    // Variants
    variants: ProductDetailVariant[]
    defaultVariant: ProductDetailVariant

    // ✅ MATCH QUERY NAME
    keyHighlights: string[]

    testimonials: ProductTestimonial[]

    howToUse?: SanityPortableText[]

    // FAQs
    faqs: {
        question: string
        answer: string
    }[]
}