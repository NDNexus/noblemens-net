/**
 * =========================================================
 * SANITY QUERIES — NOBLEMENS
 * =========================================================
 *
 * PRINCIPLES
 * ---------------------------------------------------------
 * - Keep queries readable (no over-abstraction)
 * - Separate CARD vs DETAIL data
 * - Avoid unnecessary fields
 * - Maintain consistency across queries
 *
 * =========================================================
 */

/* =========================================================
   PRODUCT CARDS (ALL PRODUCTS)
   Used for: product grids
========================================================= */
/**
 * NOTE: This query shape MUST match the SanityProductCard type in src/data/types/rawSanityData.ts
 * If you add/remove fields here, update the type accordingly.
 * 
 * "image": images[0].asset->url, - This is for product image in case the variant doesn't have its own image. We take the first product image as fallback.
 * "image": coalesce(image.asset->url, ^.images[0].asset->url) - This is for variant image. We first check if the variant has its own image, if not we fallback to the product image.
 */

export const PRODUCT_CARDS_QUERY = `
*[_type == "product"] | order(_createdAt desc){
  _id,
  title,
  "slug": slug.current,
  shortDescription,
  "image": images[0].asset->url,
  productType,

  "category": category->{
  _id,
  "slug": slug.current
  },

  variants[]{
    _key,
    name,
    volume,
    unit,
    packaging,
    hasMother,
    price,
    compareAtPrice,
    inStock,
    isDefault,

    "image": coalesce(image.asset->url, ^.images[0].asset->url),

    "attributes": attributes[showOnCard == true]{
      label,
      value
    }
  }
}
`

/* =========================================================
   FEATURED PRODUCTS
   Used for: homepage highlight section
========================================================= */

export const FEATURED_PRODUCTS_QUERY = `
*[_type == "product" && isFeatured == true] | order(_createdAt desc){
  _id,
  title,
  "slug": slug.current,
  shortDescription,
  "image": images[0].asset->url,

  variants[]{
    _key,
    volume,
    unit,
    price,
    compareAtPrice,
    isDefault,

    "image": coalesce(image.asset->url, ^.images[0].asset->url)
  }
}
`

/* =========================================================
   PRODUCTS WITH CATEGORY
   Used to get just a single parent category of the product first. We use another query to find out the category hierarchy, and build the product url.
========================================================= */

export const PRODUCT_WITH_CATEGORY_QUERY = `
*[_type == "product" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  shortDescription,
  "image": images[0].asset->url,
  productType,

  "category": category->{
    _id,
    title,
    "slug": slug.current,
    parent
  },

  variants[]{
    _key,
    name,
    volume,
    unit,
    price,
    compareAtPrice,
    isDefault,
    "image": coalesce(image.asset->url, ^.images[0].asset->url)
  }
}
`

/** =========================================================
  * ALL CATEGORIES
  * Used for: building category hierarchy and product urls
  * ========================================================= 
*/
export const ALL_CATEGORIES_QUERY = `
*[_type == "category"]{
  _id,
  title,
  "slug": slug.current,
  "parent": parent._ref
}
`

/* =========================================================
   SINGLE PRODUCT (DETAIL PAGE)
   Used for: /product/[slug]
========================================================= */

export const PRODUCT_DETAIL_QUERY = `
*[_type == "product" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  shortDescription,

  "images": images[].asset->url,
  videoUrl,

  description,
  keyBenefits,
  faqs,

  variants[]{
    _key,
    name,
    volume,
    unit,
    packaging,
    hasMother,
    price,
    compareAtPrice,
    inStock,
    isDefault,

    "image": coalesce(image.asset->url, ^.images[0].asset->url),

    attributes[]{
      label,
      value,
      showOnCard
    }
  }
}
`