/**
 * =========================================================
 * SANITY RAW TYPES (CMS DATA SHAPES)
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Defines the shape of data returned from Sanity queries.
 *
 * IMPORTANT PRINCIPLES
 * ---------------------------------------------------------
 * 1. These types represent RAW CMS data
 *    → Can be incomplete / optional
 *
 * 2. DO NOT use these directly in UI
 *    → Always map to clean UI models (Product, ProductDetail)
 *
 * 3. Query shape MUST match type shape
 *    → If you add fields in GROQ, update here
 *
 * ARCHITECTURE
 * ---------------------------------------------------------
 * Sanity (RAW) → Types → Mapper → UI Models
 *
 * =========================================================
 */

/**
 * =========================================
 * PORTABLE TEXT TYPES (FULL SUPPORT)
 * =========================================
 */

export type SanityMark = 'strong' | 'em' | 'underline'

export interface SanityPortableTextSpan {
    _type: 'span'
    text: string
    marks?: string[] // includes decorators + annotation keys
}

/**
 * Link annotation
 */
export interface SanityLinkAnnotation {
    _type: 'link'
    _key: string
    href: string
}

/**
 * Standard block (paragraphs, headings, lists)
 */
export interface SanityPortableTextBlock {
    _type: 'block'

    style?: 'normal' | 'h2' | 'h3' | 'h4' | 'blockquote'

    children?: SanityPortableTextSpan[]

    markDefs?: SanityLinkAnnotation[]

    listItem?: 'bullet' | 'number'
    level?: number
}

/**
 * Custom callout block
 */
export interface SanityCalloutBlock {
    _type: 'callout'

    type: 'note' | 'tip' | 'warning'
    content: string
}

/**
 * UNION TYPE (🔥 THIS IS THE IMPORTANT PART)
 */
export type SanityPortableText =
    | SanityPortableTextBlock
    | SanityCalloutBlock

/**
 * Raw Testimonials shape from PRODUCT_DETAILS_QUERY
 */
export interface SanityTestimonial {
    _id: string
    content?: string
    name?: string
    subtitle?: string
}

/**
 * RAW Product shape from PRODUCT_CARDS_QUERY
 */
export interface SanityProductCard {
    _id: string
    title: string
    slug: string
    shortDescription: string
    productType: string

    category: {
        _id: string
        slug: string
    }

    variants: {
        _key: string
        name: string
        volume: number
        unit: string
        packaging?: string
        hasMother?: boolean
        price: number
        compareAtPrice?: number | null
        inStock: boolean
        isDefault: boolean

        // ✅ from images[0]
        image: string

        attributes?: {
            label?: string
            value?: string
        }[]
    }[]
}


/**
 * =========================================================
 * RAW SANITY PRODUCT DETAIL TYPE
 * =========================================================
 *
 * IMPORTANT:
 * - This MUST match GROQ query exactly
 * - No UI logic here
 * - No transformations
 * =========================================================
 */

export interface SanityProductDetail {
    _id: string
    title: string
    slug: string
    shortDescription: string
    productType: string

    // Media
    images?: string[]            // from images[].asset->url
    videoUrl?: string | null

    // Rich content (Portable Text)
    description?: SanityPortableText[]

    // Highlights
    keyHighlights?: string[]

    howToUse: SanityPortableText[]

    // FAQ
    faqs?: {
        question: string
        answer: string
    }[]

    // Category (referenced)
    category?: {
        _id: string
        title: string
        slug: string
        parent?: any
    }

    // Variants
    variants: {
        _key: string

        name?: string
        volume?: number
        unit?: string

        packaging?: string
        hasMother?: boolean

        price: number
        compareAtPrice?: number | null
        inStock: boolean
        isDefault: boolean

        // 🔥 From GROQ projection
        defaultVariantImage?: string             // images[0].asset->url
        images?: string[]          // images[].asset->url

        attributes?: {
            label?: string
            value?: string
            showOnCard?: boolean
        }[]
    }[]

    testimonials?: SanityTestimonial[]
}