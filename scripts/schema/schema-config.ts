/**
 * ==========================================================
 * SCHEMA CONFIG (PRODUCTION • FLEXIBLE • TYPE-SAFE)
 * ==========================================================
 *
 * ARCHITECTURE:
 * -------------
 * 1. schemaOverrides  → page-level full control
 * 2. categorySchema   → category-level schema behavior
 * 3. schemaTemplates  → default schema by page type
 * 4. fallback         → safe default
 *
 * SUPPORTS:
 * ---------
 * ✔ Multiple schemas per page
 * ✔ Strong typing
 * ✔ Extensibility
 * ✔ SEO system alignment
 *
 * ==========================================================
 */


/**
 * ==========================================================
 * SCHEMA TYPES
 * ==========================================================
 */

export type SchemaType =
    | "Product"
    | "CollectionPage"
    | "FAQPage"
    | "Article"
    | "WebPage"


export interface BaseSchema {
    type: SchemaType
}


/**
 * ==========================================================
 * SPECIFIC SCHEMA SHAPES
 * ==========================================================
 */

export interface ProductSchema extends BaseSchema {
    type: "Product"
    name: string
    description: string
    image: string

    // Optional enrichment
    brand?: string
    category?: string
    offers?: {
        priceCurrency?: string
        price?: string
        availability?: string
    }
}


export interface CollectionSchema extends BaseSchema {
    type: "CollectionPage"
    name: string
    description: string
}


export interface FAQSchema extends BaseSchema {
    type: "FAQPage"
    questions: {
        question: string
        answer: string
    }[]
}


export interface ArticleSchema extends BaseSchema {
    type: "Article"
    title: string
    description: string
}


export interface WebPageSchema extends BaseSchema {
    type: "WebPage"
    name: string
}


/**
 * ==========================================================
 * UNIFIED TYPE
 * ==========================================================
 */

export type SchemaOverride =
    | ProductSchema
    | CollectionSchema
    | FAQSchema
    | ArticleSchema
    | WebPageSchema


/**
 * ==========================================================
 * CATEGORY SCHEMA (🔥 NEW — INHERITANCE LAYER)
 * ==========================================================
 *
 * Defines schema behavior per category
 */

export const categorySchema: Record<string, {
    brand?: string
    category?: string
}> = {

    vinegars: {
        brand: "Noblemens",
        category: "Food"
    },

    perfumes: {
        brand: "Noblemens",
        category: "Fragrance"
    }

}


/**
 * ==========================================================
 * SCHEMA TEMPLATES (DEFAULT LOGIC)
 * ==========================================================
 */

export const schemaTemplates: Record<string, SchemaType> = {

    page: "WebPage",
    landing: "WebPage",

    archive: "CollectionPage",

    product: "Product",

    post: "Article"

}


/**
 * ==========================================================
 * SCHEMA OVERRIDES (🔥 YOUR SYSTEM — KEPT INTACT)
 * ==========================================================
 *
 * KEY:
 * ----
 * page.slug
 *
 * VALUE:
 * ------
 * Array of schemas (multi-schema supported)
 */

export const schemaOverrides: Record<string, SchemaOverride[]> = {

    /**
     * PRODUCT WITH FAQ
     */
    "black-jamun-vinegar": [
        {
            type: "Product",
            name: "Black Jamun Vinegar",
            description: "Pure natural jamun vinegar with mother.",
            image: "/images/products/jamun.jpg",
            brand: "Noblemens"
        },
        {
            type: "FAQPage",
            questions: [
                {
                    question: "Is it natural?",
                    answer: "Yes, completely natural."
                }
            ]
        }
    ],

    /**
     * BLOG ARTICLE
     */
    "natural-perfumes-for-men": [
        {
            type: "Article",
            title: "Natural Perfumes for Men",
            description: "Why natural attars are better."
        }
    ]

}