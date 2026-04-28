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


/* =========================================================
   VARIANT (DETAIL PAGE)
========================================================= */

export interface ProductDetailVariant {
    key: string
    label: string

    // Pricing
    price: number
    compareAtPrice?: number

    // Media
    image: string

    // Availability
    inStock: boolean
    isDefault: boolean

    // Product properties
    packaging?: string
    hasMother?: boolean

    // Structured attributes (cleaned in mapper)
    attributes: {
        label: string
        value: string
    }[]
}


/* =========================================================
   PRODUCT DETAIL (FULL PAGE)
========================================================= */

export interface ProductDetail {
    id: string
    title: string
    slug: string

    // 🔥 Sanity Portable Text (keep flexible but explicit)
    description: unknown[]

    // Short summary (for hero section)
    shortDescription: string

    // Media
    images: string[]
    videoUrl?: string | null

    // Variants
    variants: ProductDetailVariant[]
    defaultVariant: ProductDetailVariant

    // Key Benefits (simple list)
    benefits: string[] | undefined

    // FAQs (fully validated in mapper)
    faqs: {
        question: string
        answer: string
    }[]
}