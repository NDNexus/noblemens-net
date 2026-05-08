import type { ProductCard } from "@/data/types/product"
import type { SanityProductCard } from "@/data/types/rawSanityData"
import type { ProductTestimonial } from "@data/types/productDetail"
import type { SanityTestimonial } from "@data/types/rawSanityData"

import { createWhatsAppLink } from "@/lib/utils/whatsapp"
import { resolveCategoryHierarchy } from "@lib/sanity/resolveCategoryHierarchy"

/**
 * Build meta tags for a given variant
 * Priority:
 * 1. Vinegar-specific fields (packaging, mother)
 * 2. Fallback → attributes (values only)
 */
export function getMeta(
  variant: any,
  productType: string | undefined
): string[] {
  const meta: string[] = []

  // Vinegar-specific meta
  if (productType === "vinegar" || variant.packaging) {
    if (variant.packaging) {
      meta.push(variant.packaging)
    }

    if (variant.hasMother === true) {
      meta.push("With Mother")
    }
  }

  // Fallback → attributes
  if (meta.length === 0 && variant.attributes?.length) {
    variant.attributes.forEach((attr: any) => {
      if (attr?.value) {
        meta.push(attr.value)
      }
    })
  }

  // Limit for UI cleanliness 3 items maximum
  return meta.slice(0, 3)
}

/**
 * Build all meta tags for a given variant
 * Priority:
 * 1. Packaging first
 * 2. With Mother (vinegar only)
 * 3. All attribute values
 * 4. Additional variant meta
 *
 * Returns all metadata items for display
 */

export function getAllMeta(
  variant: any,
  productType: string | undefined
): string[] {

  const meta: string[] = []

  /**
   * --------------------------------------------------
   * Packaging always first
   * --------------------------------------------------
   */

  if (variant.packaging) {
    meta.push(variant.packaging)
  }

  /**
   * --------------------------------------------------
   * Vinegar specific
   * --------------------------------------------------
   */

  if (
    productType === "vinegar" &&
    variant.hasMother === true
  ) {
    meta.push("With Mother")
  }

  /**
   * --------------------------------------------------
   * Attributes always included
   * --------------------------------------------------
   */

  if (variant.attributes?.length) {

    variant.attributes.forEach((attr: any) => {

      if (attr?.value) {
        meta.push(attr.value)
      }

    })
  }

  /**
   * --------------------------------------------------
   * Remove duplicates
   * --------------------------------------------------
   */

  return [...new Set(meta)]
}

/**
 * Adds URL Params based on the variant
 * @param baseLink 
 * @param variantKey 
 * @returns 
 */
export function buildVariantLink(baseLink: string, variantKey: string) {
  const url = new URL(baseLink, window.location.origin)
  url.searchParams.set("variant", variantKey)
  return url.pathname + url.search
}

/**
 * 
 * @param sanityData 
 * @param allCategories 
 * @returns 
 */
export function mapProductCard(
  sanityData: SanityProductCard,
  allCategories: any[]
): ProductCard {

  // -------------------------------
  // BASIC SAFE DATA
  // -------------------------------
  const id = sanityData._id

  const title = sanityData.title || "Untitled Product"
  const productType = sanityData.productType
  const description = sanityData.shortDescription || ""

  // -------------------------------
  // VARIANT SAFETY CHECK
  // -------------------------------
  if (!sanityData.variants?.length) {
    console.error(`[ProductCard] No variants found for product: ${id}`)
  }

  // -------------------------------
  // DEFAULT VARIANT
  // -------------------------------
  const defaultVariant =
    sanityData.variants?.find(v => v.isDefault) ||
    sanityData.variants?.[0]

  // -------------------------------
  // IMAGE (from default variant)
  // -------------------------------
  const image =
    defaultVariant?.image ||
    "/images/placeholders/product-placeholder.webp"

  const alt = `${title} - Product Image`

  // -------------------------------
  // VARIANTS (mapped cleanly)
  // -------------------------------
  const variants =
    sanityData.variants?.map(variant => {

      // Label (300ml, 2g etc.)
      const label =
        variant.volume && variant.unit
          ? `${variant.volume}${variant.unit}`
          : variant.name || "Variant"

      // Correct logic (no assignment bug)
      const hasMother =
        productType === "vinegar" && variant.hasMother === true

      const packaging = variant.packaging || ""

      return {
        key: variant._key,
        label,
        price: variant.price || 0,
        compareAt: variant.compareAtPrice ?? null,
        image: variant.image || image,
        isDefault: variant.isDefault || false,
        hasMother,
        packaging,
        attributes: variant.attributes || []
      }
    }) || []

  // -------------------------------
  // PRICE (default variant)
  // -------------------------------
  const price = {
    current: defaultVariant?.price || 0,
    compareAt: defaultVariant?.compareAtPrice ?? null
  }

  // -------------------------------
  // CATEGORY HIERARCHY
  // -------------------------------

  const categoryId =
    sanityData.category?._id

  /**
   * Full resolved hierarchy
   *
   * Example:
   * [
   *   "products",
   *   "vinegars"
   * ]
   */
  const categoryPath =
    resolveCategoryHierarchy(
      categoryId,
      allCategories
    )

  /**
   * Full product hierarchy
   *
   * Example:
   * [
   *   "products",
   *   "vinegars",
   *   "apple-cider-vinegar"
   * ]
   */
  const hierarchy = [
    ...categoryPath,
    sanityData.slug
  ]

  /**
 * =========================================================
 * URL PATH
 * =========================================================
 *
 * Final resolved canonical product URL
 *
 * Example:
 * /products/vinegars/apple-cider-vinegar
 */

  const urlPath =
    "/" + hierarchy.join("/")

  /**
   * =========================================================
   * META
   * =========================================================
   *
   * Uses default variant for primary metadata
   */

  const meta = defaultVariant
    ? getMeta(defaultVariant, productType)
    : []

  /**
   * =========================================================
   * DEFAULT ORDER LINK
   * =========================================================
   */

  const orderLink = createWhatsAppLink({
    title,
    urlPath,
    price: price.current,

  })

  // -------------------------------
  // FINAL RETURN
  // -------------------------------
  return {
    id,
    title,
    description,
    image,
    alt,
    variants,
    meta,
    price,
    link: urlPath,
    orderLink
  }
}


/**
 * =========================================================
 * PRODUCT DETAIL MAPPER
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Transforms RAW Sanity data into a CLEAN UI-ready structure.
 *
 * WHY THIS EXISTS
 * ---------------------------------------------------------
 * - Keeps UI independent from CMS structure
 * - Handles edge cases safely
 * - Provides predictable data to render layer
 *
 * =========================================================
 */

import type { SanityProductDetail, RawSanityCategory } from "@/data/types/rawSanityData"
import type {
  ProductDetail, ProductDetailVariant
} from "@/data/types/productDetail"

/**
 * Helper: Safely build variant label
 */
function buildVariantLabel(
  name?: string,
  volume?: number,
  unit?: string
): string {
  if (volume && unit) return `${volume}${unit}`
  if (name) return name
  return "Variant"
}

/**
 * Main mapper function
 */
export function mapProductDetail(
  data: SanityProductDetail | null, allCategories: RawSanityCategory[]
): ProductDetail {
  // -------------------------------
  // HARD FAIL (critical data missing)
  // -------------------------------
  if (!data) {
    throw new Error("[ProductDetailMapper] No product data received from Sanity")
  }

  if (!data._id || !data.title || !data.slug) {
    throw new Error(
      `[ProductDetailMapper] Missing required product fields (id/title/slug)`
    )
  }

  if (!data.variants || data.variants.length === 0) {
    throw new Error(
      `[ProductDetailMapper] Product "${data.title}" has no variants`
    )
  }

  console.log("RAW TESTIMONIALS FROM SANITY:", data?.testimonials)


  /**
   * --------------------------------
   * TYPE GUARD - FOR TESTIMONIALS
   * --------------------------------
   * Ensures testimonial has required fields
   */
  function isValidTestimonial(
    t: SanityTestimonial
  ): t is SanityTestimonial & { content: string; name: string } {
    return typeof t?.content === "string" && typeof t?.name === "string"
  }

  /**
   * --------------------------------
   * TESTIMONIALS (clean + safe)
   * --------------------------------
   */
  const testimonials: ProductTestimonial[] = (data.testimonials ?? [])
    .filter(isValidTestimonial)
    .map((t) => ({
      content: t.content.trim(),
      name: t.name.trim(),
      ...(t.subtitle ? { subtitle: t.subtitle.trim() } : {}) // Add subtitle if it exists otherwise omit from object.
    }))

  // -------------------------------
  // MAP VARIANTS
  // -------------------------------
  const variants: ProductDetailVariant[] = data.variants.map((v) => {
    if (!v._key) {
      console.warn(
        `[ProductDetailMapper] Variant missing key in product "${data.title}"`
      )
    }

    if (!v.price && v.price !== 0) {
      console.warn(
        `[ProductDetailMapper] Variant "${v._key}" missing price`
      )
    }

    /**
   * --------------------------------
   * MERGE IMAGES (variant → product)
   * --------------------------------
   * - Variant images first (priority)
   * - Then fallback to product images
   * - Remove duplicates
   */
    const mergedImages = Array.from(
      new Set([
        ...(v.images || []),
        ...(data.images || [])
      ].filter(Boolean))
    )

    console.log("[ProductDetailMapper] Images of variant: ", v.images);
    console.log("[ProductDetailMapper] Images of product: ", data.images);

    console.log("============================================================")
    console.log("[ProductDetailMapper] VARIANT OBJECT is: ", v)
    console.log("============================================================")

    const variantMeta = getAllMeta(v, data.productType)

    console.log("============================================================")
    console.log("[MAPPERS] variantMeta is: ", variantMeta)
    console.log("============================================================")

    return {
      key: v._key,

      label: buildVariantLabel(v.name, v.volume, v.unit),

      // Pricing
      price: v.price ?? 0,
      compareAtPrice: v.compareAtPrice ?? null,

      /**
     * --------------------------------
     * MEDIA
     * --------------------------------
     * - Main image = first valid image
     * - Fallback to placeholder if empty
     */
      image:
        mergedImages[0] ||
        "/images/placeholders/product-placeholder.webp",

      images: mergedImages,

      meta: variantMeta,

      // Availability
      inStock: v.inStock ?? true,
      isDefault: v.isDefault ?? false,

      // Product-specific
      ...(v.packaging !== undefined && { packaging: v.packaging }),
      ...(v.hasMother !== undefined && { hasMother: v.hasMother }),

      // Attributes cleanup
      attributes:
        v.attributes
          ?.filter(
            (attr): attr is { label: string; value: string } =>
              Boolean(attr?.label && attr?.value)
          )
          .map((attr) => ({
            label: attr.label!,
            value: attr.value!,
          })) || [],
    }
  })

  // -------------------------------
  // DEFAULT VARIANT (CRITICAL)
  // -------------------------------
  const defaultVariant =
    variants.find((v) => v.isDefault) || variants[0]

  if (!defaultVariant) {
    throw new Error(
      `[ProductDetailMapper] Could not determine default variant for "${data.title}"`
    )
  }

  // -------------------------------
  // CATEGORY HIERARCHY
  // -------------------------------

  const categoryId =
    data.category?._id

  /**
   * Example:
   * [
   *   "products",
   *   "vinegars"
   * ]
   */
  const categoryPath =
    resolveCategoryHierarchy(
      categoryId,
      allCategories
    )

  /**
   * Example:
   * [
   *   "products",
   *   "vinegars",
   *   "apple-cider-vinegar"
   * ]
   */
  const hierarchy = [
    ...categoryPath,
    data.slug
  ]

  /**
   * Final canonical URL
   *
   * Example:
   * /products/vinegars/apple-cider-vinegar
   */
  const urlPath =
    "/" + hierarchy.join("/")

  // -------------------------------
  // FINAL OBJECT
  // -------------------------------
  const mappedProduct: ProductDetail = {
    id: data._id,
    title: data.title,
    slug: data.slug,
    categoryPath,
    hierarchy,
    urlPath,

    productType: data.productType || "unknown",

    /**
     * Using this ?? to make sure empty arrays also are safely passed through.
     * Using || here would have made the valid empty [] to return false, which we do not want here.
     * Quick remembering tip: ?? = only fix missing data, not valid empty data.
     */
    description: data.description ?? [],

    // Hero content
    shortDescription: data.shortDescription || "",

    // Media
    images: data.images || [],
    videoUrl: data.videoUrl ?? null,

    // Variants
    variants,
    defaultVariant,

    // Highlights
    keyHighlights: data.keyHighlights || [],

    testimonials,

    // How To Use (Portable Text)
    howToUse: data.howToUse ?? [],

    // FAQs
    faqs:
      data.faqs?.filter((f) => f?.question && f?.answer) || [],
  }

  return mappedProduct
}