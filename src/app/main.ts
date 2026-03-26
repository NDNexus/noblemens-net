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
}


// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}