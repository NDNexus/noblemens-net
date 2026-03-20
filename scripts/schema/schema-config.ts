/**
 * ==========================================================
 * SCHEMA CONFIG (SIMPLE + FLEXIBLE)
 * ==========================================================
 *
 * You can override or ADD schemas per page.
 */

export type SchemaType =
    | "Product"
    | "CollectionPage"
    | "FAQPage"
    | "Article"

export interface BaseSchema {
    type: SchemaType
}

/**
 * Specific schema shapes
 */

export interface ProductSchema extends BaseSchema {
    type: "Product"
    name: string
    description: string
    image: string
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

/**
 * Unified type
 */
export type SchemaOverride =
    | ProductSchema
    | CollectionSchema
    | FAQSchema
    | ArticleSchema

/**
 * KEY CHANGE:
 * Page can have MULTIPLE schemas
 */
export const schemaOverrides: Record<string, SchemaOverride[]> = {

    /**
     * Example: Product page with FAQ
     */
    "black-jamun-vinegar": [
        {
            type: "Product",
            name: "Black Jamun Vinegar",
            description: "Pure natural jamun vinegar with mother.",
            image: "/images/products/jamun.jpg"
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
     * Example: Blog article
     */
    "natural-perfumes-for-men": [
        {
            type: "Article",
            title: "Natural Perfumes for Men",
            description: "Why natural attars are better."
        }
    ]

}