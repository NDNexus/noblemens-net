import type { ProductCard } from "@/data/types/product"
import type { SanityProductCard } from "@/data/types/rawSanityData"

import { buildCategoryPath } from "@/lib/utils/category"

export function mapProductCard(
  sanityData: SanityProductCard,
  allCategories: any[]
): ProductCard {

  const id = sanityData._id

  const title = sanityData.title || "Untitled Product"

  const description = sanityData.shortDescription || ""

  // -------------------------------
  // DEFAULT VARIANT
  // -------------------------------
  const defaultVariant =
    sanityData.variants?.find(v => v.isDefault) ||
    sanityData.variants?.[0]

  // -------------------------------
  // IMAGE
  // -------------------------------
  const image =
    defaultVariant?.image ||
    sanityData.image ||
    "/images/placeholders/product-placeholder.webp"

  const alt = `${title} - Product Image`

  // -------------------------------
  // VARIANTS
  // -------------------------------
  const variants =
    sanityData.variants?.map(variant => {
      const label =
        variant.volume && variant.unit
          ? `${variant.volume}${variant.unit}`
          : variant.name || "Variant"

      return {
        key: variant._key,
        label,
        price: variant.price || 0,
        compareAt: variant.compareAtPrice ?? null,
        image: variant.image || image,
        isDefault: variant.isDefault || false
      }
    }) || []

  // -------------------------------
  // PRICE
  // -------------------------------
  const price = {
    current: defaultVariant?.price || 0,
    compareAt: defaultVariant?.compareAtPrice ?? null
  }

  // -------------------------------
  // CATEGORY PATH (for building urls)
  // -------------------------------
  const categoryId = sanityData.category?._id

  const categoryPath = categoryId
    ? buildCategoryPath(categoryId, allCategories)
    : []

  // -------------------------------
  // LINKS
  // -------------------------------
  const link =
    categoryPath.length > 0
      ? `/products/${categoryPath.join("/")}/${sanityData.slug}`
      : `/products/${sanityData.slug}`

  const orderLink = "#"

  // -------------------------------
  // META (placeholder for now)
  // -------------------------------
  const meta = ""

  return {
    id,
    title,
    description,
    image,
    alt,
    variants,
    meta,
    price,
    link,
    orderLink
  }
}