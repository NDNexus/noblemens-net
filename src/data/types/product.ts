/**
 * This file contains TypeScript type definitions for the Product schema in Sanity.
 */

export interface ProductCard {
  id: string
  title: string
  description: string
  image: string
  alt: string
  productType?: string

  variants: {
    key: string
    label: string   // "300ml"
    price: number
    compareAt: number | null
    image: string
    isDefault: boolean
  }[]

  meta: string[]

  price: {
    current: number
    compareAt: number | null
  }

  link: string
  orderLink: string
}