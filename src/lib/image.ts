/**
 * ==========================================================
 * IMAGE UTILITIES (ENTERPRISE / PRODUCTION GRADE)
 * ==========================================================
 *
 * PURPOSE
 * ----------------------------------------------------------
 * Centralized system for handling ALL image logic.
 *
 * RESPONSIBILITIES
 * ----------------------------------------------------------
 * ✔ Safe image source resolution
 * ✔ Category-based fallback placeholders
 * ✔ Lazy loading + decoding optimization
 * ✔ Runtime error handling (broken images)
 * ✔ Alt text handling (SEO + accessibility)
 *
 *
 * DESIGN PRINCIPLES
 * ----------------------------------------------------------
 * ✔ Single source of truth for images
 * ✔ No duplication across components
 * ✔ Context-aware (category, overrides)
 * ✔ Easily extendable (CDN, resizing, formats)
 *
 *
 * FUTURE EXTENSIONS
 * ----------------------------------------------------------
 * - CDN (Cloudinary / Imgix)
 * - WebP / AVIF auto format
 * - Responsive images (srcset)
 * - Blur-up placeholders
 *
 * ==========================================================
 */


/* =========================================================
   PLACEHOLDER CONFIGURATION
========================================================= */

/**
 * Centralized placeholder mapping
 * Modify here → updates entire app
 */
const PLACEHOLDERS: Record<string, string> = {
    default: "/images/placeholders/default.webp",

    /**
     * Content categories
     */
    blog: "/images/placeholders/blog.webp",
    vinegars: "/images/placeholders/vinegar.webp",
    perfumes: "/images/placeholders/perfume.webp"
};


/* =========================================================
   TYPES
========================================================= */

export interface ImageOptions {
    /**
     * Explicit fallback (highest priority)
     */
    fallback?: string;

    /**
     * Category-based fallback
     */
    category?: string;

    /**
     * Enable lazy loading (default: true)
     */
    lazy?: boolean;

    /**
     * Enable async decoding (default: true)
     */
    asyncDecode?: boolean;

    /**
     * Alt text fallback
     */
    altFallback?: string;
}


/* =========================================================
   INTERNAL: RESOLVE PLACEHOLDER
========================================================= */

/**
 * Resolves fallback image based on category
 */
function resolvePlaceholder(category?: string): string {
    if (!category) return PLACEHOLDERS.default;

    return PLACEHOLDERS[category] || PLACEHOLDERS.default;
}


/* =========================================================
   CORE: SAFE IMAGE SRC
========================================================= */

/**
 * Returns a safe image URL
 *
 * Handles:
 * - missing src
 * - empty string
 * - invalid types
 * - category-based fallback
 */
export function getImageSrc(
    src?: string,
    options: ImageOptions = {}
): string {

    const fallback =
        options.fallback ||
        resolvePlaceholder(options.category);

    if (!src || typeof src !== "string") {
        return fallback;
    }

    const clean = src.trim();

    if (clean === "") {
        return fallback;
    }

    return clean;
}


/* =========================================================
   DOM HELPER: APPLY IMAGE
========================================================= */

/**
 * Applies full image logic to an <img> element
 *
 * Includes:
 * ✔ src assignment
 * ✔ fallback handling
 * ✔ lazy loading
 * ✔ decoding optimization
 * ✔ alt text fallback
 * ✔ runtime error recovery
 */
export function applyImage(
    img: HTMLImageElement,
    src?: string,
    options: ImageOptions = {}
): void {

    if (!img) return;

    const {
        category,
        fallback,
        lazy = true,
        asyncDecode = true,
        altFallback = "Image"
    } = options;

    /**
     * Resolve fallback (priority: explicit > category > default)
     */
    const resolvedFallback =
        fallback || resolvePlaceholder(category);

    /**
     * Assign safe src
     */
    const finalSrc = getImageSrc(src, {
        fallback: resolvedFallback
    });

    img.src = finalSrc;

    /**
     * ALT TEXT (SEO + accessibility)
     */
    if (!img.alt || img.alt.trim() === "") {
        img.alt = altFallback;
    }

    /**
     * Lazy loading
     */
    if (lazy) {
        img.loading = "lazy";
    }

    /**
     * Async decoding
     */
    if (asyncDecode) {
        img.decoding = "async";
    }

    /**
     * Handle broken images
     */
    img.onerror = () => {
        if (img.src !== resolvedFallback) {
            img.src = resolvedFallback;
        }
    };
}


/* =========================================================
   OPTIONAL: FUTURE CDN TRANSFORM
========================================================= */

/**
 * Placeholder for future image transformation
 * (CDN / resizing / format switching)
 */
export function transformImageURL(
    src: string,
    options?: {
        width?: number;
        format?: "webp" | "jpg" | "png";
    }
): string {

    /**
     * Example future:
     *
     * return `${CDN_URL}/${src}?w=${options?.width}&format=${options?.format}`;
     */

    return src;
}