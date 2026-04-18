/**
 * ==========================================================
 * NOBLEMENS — BLOG CARD COMPONENT (PRODUCTION)
 * ==========================================================
 *
 * PURPOSE
 * ----------------------------------------------------------
 * - Render a blog card from a reusable HTML template
 * - Bind post data into the template
 * - Return a ready-to-use DOM element
 *
 *
 * ARCHITECTURE
 * ----------------------------------------------------------
 * HTML Template → Structure (pure markup)
 * TypeScript     → Data binding only
 *
 *
 * WHY THIS APPROACH
 * ----------------------------------------------------------
 * ✔ No runtime fetch (faster, more reliable)
 * ✔ No Vite dev-server issues
 * ✔ Template is bundled at build-time
 * ✔ Fully predictable output
 *
 *
 * REQUIREMENTS
 * ----------------------------------------------------------
 * Template must be:
 * - HTML fragment ONLY (no <html>, <head>, <script>)
 * - Located inside /src (NOT /public)
 *
 * Example:
 * /src/templates/blog/blog-card.html
 *
 *
 * ==========================================================
 */


/* =========================================================
   TEMPLATE IMPORT (BUILD-TIME)
========================================================= */

/**
 * Vite feature:
 * ---------------------------------------------------------
 * `?raw` imports file as string at build time
 *
 * Result:
 * template = "<article>...</article>"
 *
 * ✔ No fetch
 * ✔ No network request
 * ✔ No Vite script injection bugs
 */
import template from "@templates/blog/blog-card.html?raw";


/* =========================================================
   TYPES (OPTIONAL BUT RECOMMENDED)
========================================================= */

import type { FormattedPost } from "@lib/formatPost";

/**
 * Image handling utility (centralized system)
 *
 * WHAT IT DOES
 * ----------------------------------------------------------
 * - Safely applies image source with fallback handling
 * - Supports category-based placeholders
 * - Enables lazy loading + async decoding
 * - Handles broken image errors gracefully
 *
 * WHY WE USE THIS
 * ----------------------------------------------------------
 * - Avoid repeating image fallback logic across components
 * - Ensure consistent behavior across the entire app
 * - Prepare for future upgrades (CDN, responsive images, WebP)
 *
 * USAGE
 * ----------------------------------------------------------
 * applyImage(imgElement, src, {
 *   category: post.category,
 *   altFallback: post.title
 * });
 *
 * IMPORTANT
 * ----------------------------------------------------------
 * ❌ Do NOT manually set img.src elsewhere
 * ✅ Always use applyImage() for consistency
 */
import { applyImage } from "@lib/image";

/**
 * Meta rendering utility (flexible metadata rows)
 *
 * WHAT IT DOES
 * ----------------------------------------------------------
 * Renders a list of metadata items with customizable separators
 *
 * WHY WE USE THIS
 * ----------------------------------------------------------
 * - Reusable across different card types
 * - Consistent styling and layout
 * - Easy to maintain and update
   * USAGE
 * ----------------------------------------------------------
 * renderMeta(metaContainer, [
 *   { label: post.categoryLabel },
 *   { label: post.displayDate },
 *   { label: post.readingTimeText }
 * ], {
 *   separator: "•"
 * });
   * IMPORTANT
 * ----------------------------------------------------------
 * ❌ Do NOT hardcode meta layout in the component
 * ✅ Use renderMeta() for all metadata rendering
 */

import { renderMeta } from "@lib/renderMeta";



/* =========================================================
   CREATE BLOG CARD
========================================================= */

/**
 * Creates a blog card DOM element
 *
 * @param post - Blog post data object
 * @returns HTMLElement (ready to append to DOM)
 */
export function createBlogCard(post: FormattedPost): HTMLElement {

   /* -------------------------------------------------------
      CREATE DOM FROM TEMPLATE
   ------------------------------------------------------- */

   const wrapper = document.createElement("div");

   /**
    * Convert template string → DOM
    */
   wrapper.innerHTML = template.trim();

   const card = wrapper.firstElementChild as HTMLElement;

   /**
    * Safety check
    */
   if (!card) {
      throw new Error("❌ Blog card template failed to load or is empty");
   }


   /* -------------------------------------------------------
      FIELD REFERENCES
   ------------------------------------------------------- */

   const imageLink = card.querySelector<HTMLAnchorElement>('[data-field="image-link"]');
   const image = card.querySelector<HTMLImageElement>('[data-field="image"]');

   const meta = card.querySelector('[data-field="meta"]') as HTMLElement | null;
   const titleLink = card.querySelector('[data-field="title-link"]') as HTMLAnchorElement | null;
   const readMoreBtn = card.querySelector('[data-field="read-more-btn"]') as HTMLAnchorElement | null;
   const description = card.querySelector('[data-field="description"]') as HTMLElement | null;


   /* -------------------------------------------------------
      DATA BINDING
   ------------------------------------------------------- */

   /**
    * IMAGE
    */
   if (image) {
      applyImage(image, post.image, {
         altFallback: post.title
      });
   }

   if (imageLink) {
      imageLink.href = post.url || "#";
   }

   /**
    * META (Category + Date)
    */
   if (meta) {
      renderMeta(meta, [
         { label: post.categoryLabel, className: "meta-category" },
         { label: post.displayDate, className: "meta-date" },
         { label: post.readingTimeText, className: "meta-reading" }
      ],
         { separator: 
            `<span class="meta-separator"></span>`
         });
   }


   if (titleLink) {
      const title = post.title || "Untitled Article";
      const url = post.url || "#";

      titleLink.textContent = title;
      titleLink.href = url;
   }


   /**
    * DESCRIPTION
    */
   if (description) {
      description.textContent = post.description || "";
   }

   if (readMoreBtn) {
      const url = post.url || "#";

      readMoreBtn.href = url;
   }


   /* -------------------------------------------------------
      RETURN FINAL ELEMENT
   ------------------------------------------------------- */

   return card;
}