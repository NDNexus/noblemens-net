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
 * This is the RAW product shape returned from Sanity query: PRODUCT_CARDS_QUERY
 */
export interface SanityProductCard {
    _id: string
    title?: string
    slug: string
    shortDescription?: string
    image?: string
    productType?: string

    category?: {
        _id: string
        slug: string
    }
    
    variants?: {
        _key: string
        name?: string
        volume?: number
        unit?: string
        packaging?: string
        hasMother?: boolean
        price?: number
        compareAtPrice?: number
        inStock?: boolean
        isDefault?: boolean
        image?: string
        attributes?: {
            label?: string
            value?: string
        }[]
    }[]
}