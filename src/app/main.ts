/**
 * =========================================================
 * NOBLEMENS APP — MAIN ENTRY POINT
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Initializes all global client-side systems and components.
 *
 * This file acts as the central bootstrap layer where:
 * - UI components are initialized
 * - Layout systems are activated
 * - Global DOM enhancements are applied
 *
 *
 * STRUCTURE
 * ---------------------------------------------------------
 * 1. Third-party setup (Icon libraries, etc.)
 * 2. DOM transformations (progressive enhancement)
 * 3. Component initialization
 * 4. Layout system initialization
 *
 *
 * IMPORTANT RULES
 * ---------------------------------------------------------
 * - Do NOT write feature logic directly here
 * - Keep this file orchestration-only
 * - All logic should live in dedicated modules
 *
 * =========================================================
 */


/* =========================================================
   THIRD-PARTY SETUP
========================================================= */

// Register Iconify Web Component
import 'iconify-icon';


/* =========================================================
   DOM ENHANCEMENTS — ICON SYSTEM
========================================================= */

/**
 * PURPOSE
 * ---------------------------------------------------------
 * Allows simplified icon usage in HTML:
 *
 * Instead of:
 * <iconify-icon icon="tabler:home"></iconify-icon>
 *
 * You can write:
 * <i icon="tabler:home"></i>
 *
 *
 * HOW IT WORKS
 * ---------------------------------------------------------
 * - Finds all <i icon="..."> elements
 * - Replaces them with <iconify-icon>
 * - Preserves class names for styling
 *
 *
 * NOTE
 * ---------------------------------------------------------
 * - Runs once on initial load
 * - Should be re-run if dynamic DOM is injected later
 */
function initIconifyReplacement(): void {
   const elements = document.querySelectorAll<HTMLElement>('i[icon]');

   elements.forEach((el) => {
      const name = el.getAttribute('icon');
      if (!name) return;

      const icon = document.createElement('iconify-icon');

      icon.setAttribute('icon', name);
      icon.className = el.className;

      el.replaceWith(icon);
   });
}


/* =========================================================
   COMPONENTS
========================================================= */

import { initNavbar } from '@components/navbar';


/* =========================================================
   LAYOUT SYSTEMS
========================================================= */

import { initHeaderHeightSystem } from '@app-layout/headerHeight';
import { initScrollSystem } from '@app-layout/scroll';
import { initArchive } from '@app-layout/archives';

/**
 * TOC SYSTEM (🔥 NEW)
 * ---------------------------------------------------------
 * Handles:
 * - Nested expand/collapse (VS Code style)
 * - Global TOC collapse/expand
 * - Hide/show behavior
 * - Mobile auto-collapse on link click
 *
 * NOTE:
 * - Safe to initialize globally
 * - Automatically activates only if TOC exists in DOM
 */
import { initTOC } from '@app-layout/toc';

/* =========================================================
   RENDER SYSTEMS
========================================================= */

import { renderLatestPosts } from '@render/renderLatestPosts';

/* =========================================================
   PAGE-SPECIFIC RENDERING
========================================================= */

/**
 * ==========================================================
 * 404 PAGE ENHANCEMENTS
 * ==========================================================
 *
 * PURPOSE
 * ----------------------------------------------------------
 * - Render dynamic content on 404 page
 * - Improves UX and recovery rate
 *
 * BEHAVIOR
 * ----------------------------------------------------------
 * - Detects 404 page via URL or DOM
 * - Injects latest blog posts
 *
 * SAFETY
 * ----------------------------------------------------------
 * - Runs only if container exists
 * - No impact on other pages
 *
 * ==========================================================
 */
function init404Page(): void {

   /**
    * Ensure we are on 404 page
    */
   const page = document.body.dataset.page;
   if (page !== "not-found") return;

   /**
    * Find container
    */
   const container = document.getElementById('latest-posts');
   if (!container) return;

   /**
    * Render latest posts
    */
   renderLatestPosts(container, 6);
}

/* ==========================================================
   RENDER PRODUCTS SYSTEM
========================================================== */

import { fetchSanity } from "@lib/sanity/fetch"

import { renderProducts } from "@render/renderProducts"

import { renderProductFilters } from "@render/renderProductFilters"

import {
   PRODUCT_CARDS_QUERY,
   ALL_CATEGORIES_QUERY
} from "@/lib/sanity/queries"

import type { SanityProductCard, RawSanityCategory } from "@/data/types/rawSanityData"

import { filterProductsByCategory, getProductFilters } from "@/data/productCategories"

import { mapProductCard } from "@/lib/sanity/mappers"


/**
 * =========================================================
 * INITIALIZE PRODUCT SYSTEM
   * =========================================================
 *
 * Handles:
 * - archive product grids
   * - homepage featured product grids
      * - optional archive filter bar
         *
 * Uses:
 * data - products - grid
   * data - category
   * data - limit
   *
 * =========================================================
 */

export async function initProductArchivePage(): Promise<void> {

   /**
    * ------------------------------------------------------
    * ALL PRODUCT GRIDS
    * ------------------------------------------------------
    */

   const productGrids =
      document.querySelectorAll<HTMLElement>(
         "[data-products-grid]"
      )

   if (!productGrids.length) {

      console.warn(
         "[ProductSystem] No product grids found."
      )

      return

   }

   /**
    * ------------------------------------------------------
    * FILTER BAR (OPTIONAL)
    * ------------------------------------------------------
    */

   const filterBar =
      document.getElementById(
         "products-filter-bar"
      )

   try {

      /**
       * ---------------------------------------------------
       * FETCH DATA ONCE
       * ---------------------------------------------------
       */

      const [products, categories] =
         await Promise.all([

            fetchSanity<SanityProductCard[]>(
               PRODUCT_CARDS_QUERY
            ),

            fetchSanity<RawSanityCategory[]>(
               ALL_CATEGORIES_QUERY
            )

         ])

      /**
       * ---------------------------------------------------
       * INITIALIZE ALL PRODUCT GRIDS
       * ---------------------------------------------------
       */

      productGrids.forEach(productsGrid => {

         /**
          * Category
          */

         const category =
            productsGrid.dataset.category

         /**
          * Limit
          */

         const limit =
            productsGrid.dataset.limit
               ? Number(productsGrid.dataset.limit)
               : undefined

         /**
          * Debug
          */

         console.log(
            `[ProductSystem] Grid category: ${category || "ALL"}`
         )

         console.log(
            `[ProductSystem] Grid limit: ${limit || "NONE"}`
         )

         /**
          * Filter products
          */

         const filteredProducts =

            category

               ? filterProductsByCategory(
                  products,
                  categories,
                  category
               )

               : products


         /**
          * Map + limit
          */

         const mappedProducts =
            filteredProducts
               .map(product =>

                  mapProductCard(
                     product,
                     categories
                  )

               )
               .slice(
                  0,
                  limit || filteredProducts.length
               )

         /**
          * Render
          */

         renderProducts(
            mappedProducts,
            productsGrid
         )

      })

      /**
       * ---------------------------------------------------
       * FILTER BAR (ARCHIVE ONLY)
       * ---------------------------------------------------
       */

      if (!filterBar) return

      /**
       * Main archive grid only
       */

      const archiveGrid =
         document.querySelector<HTMLElement>(
            '[data-products-grid]:not([data-limit])'
         )

      if (!archiveGrid) return


      /**
       * Render filters
       */

      renderProductFilters(

         filterBar,

         getProductFilters(
            products,
            categories
         ),

         archiveGrid,

         products,

         categories

      )

   }

   catch (error) {

      console.error(
         "[ProductSystem] Initialization failed:",
         error
      )

   }

}

import { initProductZoom } from '@components/productZoom'
import { initProductPage } from "@/app/render/renderSingleProduct"


/* =========================================================
   INITIALIZATION
========================================================= */

/**
 * Bootstraps the application
 */
function initApp(): void {

   /* -------------------------------------------------------
      DOM Enhancements
   ------------------------------------------------------- */
   initIconifyReplacement();

   /* -------------------------------------------------------
      Components
   ------------------------------------------------------- */
   initNavbar();

   /* -------------------------------------------------------
      Layout Systems
   ------------------------------------------------------- */

   /**
    * Order matters:
    * 1. Header system (sets CSS variables)
    * 2. Scroll system (depends on layout offsets)
    * 3. TOC system (depends on scroll + layout)
    */
   initHeaderHeightSystem();
   initScrollSystem();
   initTOC();

   initArchive();

   // Initialize single product page actions
   initProductZoom();
   initProductPage();

   /* -------------------------------------------------------
    Page-Specific Systems
 ------------------------------------------------------- */

   init404Page();

   /* -------------------------------------------------------
    Products Page initialization
 ------------------------------------------------------- */

   initProductArchivePage();
}


// Initialize when DOM is ready
if (document.readyState === 'loading') {
   document.addEventListener('DOMContentLoaded', initApp);
} else {
   initApp();
}

