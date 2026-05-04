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


export const PRODUCT_CARDS_QUERY = `
*[_type == "product"] | order(_createdAt desc){
  _id,
  title,
  "slug": slug.current,
  shortDescription,
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

    "image": images[0].asset->url,

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

  variants[]{
    _key,
    volume,
    unit,
    price,
    compareAtPrice,
    isDefault,

    "image": images[0].asset->url
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
    "image": images[0].asset->url
  }
}
`;

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
   Used for: /product/category/.../[slug]
========================================================= */
export const PRODUCT_DETAIL_QUERY = `
*[_type == "product" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  shortDescription,
  productType,

  // OPTIONAL shared (lifestyle) images
  "images": images[].asset->url,
  videoUrl,

  // FULL rich content
  description,
  keyHighlights,
  howToUse,

  faqs[]{
    question,
    answer
  },

  // CATEGORY (you missed this earlier here — important)
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
    packaging,
    hasMother,
    price,
    compareAtPrice,
    inStock,
    isDefault,

    // ✅ PRIMARY image (for quick use)
    "defaultVariantImage": images[0].asset->url,

    // ✅ FULL gallery for zoom system
    "images": images[].asset->url,

    attributes[]{
      label,
      value,
      showOnCard
    }
  },

   "testimonials": *[
    _type == "testimonial" &&
    references(^._id)
  ] | order(_createdAt desc) {
    _id,
    content,
    name,
    subtitle
  }
}
`;

