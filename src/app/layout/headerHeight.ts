/**
 * =========================================================
 * NOBLEMENS LAYOUT SYSTEM — HEADER HEIGHT (PRODUCTION)
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Dynamically calculates the height of the site header and
 * exposes it as a global CSS variable:
 *
 *   --header-height
 *
 * This ensures consistent layout behavior across:
 * - Fixed header offset (site-main spacing)
 * - Anchor scroll alignment (scroll-padding-top)
 * - Sticky elements (blog nav, TOC, filters)
 *
 *
 * CORE PROBLEM THIS SOLVES
 * ---------------------------------------------------------
 * When using `position: fixed`, the header is removed from
 * normal document flow, so content does NOT automatically
 * sit below it.
 *
 * Additionally:
 * - Header height is NOT constant
 * - It changes across breakpoints
 * - It changes with dynamic content (menus, banners)
 *
 * Hardcoding height = fragile ❌
 * Dynamic measurement = reliable ✅
 *
 *
 * HOW IT WORKS
 * ---------------------------------------------------------
 * 1. Waits until header exists (supports async includes)
 * 2. Measures header height using offsetHeight
 * 3. Updates CSS variable on :root
 * 4. Reacts to:
 *    - window load
 *    - resize
 *    - orientation changes
 *    - header size changes (ResizeObserver)
 *
 *
 * WHY offsetHeight (NOT getBoundingClientRect)
 * ---------------------------------------------------------
 * offsetHeight:
 * - Includes padding + borders
 * - More stable for layout calculations
 * - Better for fixed elements
 *
 *
 * REQUIREMENTS
 * ---------------------------------------------------------
 * - Header must have class: `.site-header`
 * - CSS must define fallback:
 *
 *   :root {
 *     --header-height: 80px;
 *   }
 *
 *
 * USAGE IN CSS
 * ---------------------------------------------------------
 * .site-main {
 *   margin-top: var(--header-height);
 * }
 *
 * html {
 *   scroll-padding-top: var(--header-height);
 * }
 *
 *
 * FAILURE HANDLING
 * ---------------------------------------------------------
 * - Retries if header not found
 * - Logs warning if permanently missing
 * - Never breaks layout (fallback still applies)
 *
 *
 * PERFORMANCE
 * ---------------------------------------------------------
 * - ResizeObserver → efficient + reactive
 * - Minimal DOM reads
 * - No heavy loops
 *
 * =========================================================
 */

export function initHeaderHeightSystem(): void {

    /**
     * =========================================================
     * UPDATE FUNCTION
     * =========================================================
     * Measures header height and updates CSS variable
     */
    const updateHeight = (): boolean => {

        const header =
            document.querySelector<HTMLElement>('.site-header') ||
            document.querySelector<HTMLElement>('.blog-header');

        if (!header) return false;

        const height = header.offsetHeight;

        document.documentElement.style.setProperty(
            '--header-height',
            `${height}px`
        );

        return true;
    };


    /**
     * =========================================================
     * RETRY SYSTEM (for async includes)
     * =========================================================
     * Attempts multiple times until header exists
     */
    const tryInit = (attempts = 10): void => {

        const success = updateHeight();

        if (!success && attempts > 0) {
            setTimeout(() => tryInit(attempts - 1), 100);
        }

        if (!success && attempts === 0) {
            console.warn('[HeaderHeight] .site-header or .blog-header not found after retries');
        }
    };


    /**
     * =========================================================
     * INITIALIZATION
     * =========================================================
     */

    // Wait for full load (ensures includes + layout ready)
    window.addEventListener('load', () => {

        // Initial measurement (with retry safety)
        tryInit();

        /**
         * =========================================================
         * RESIZE OBSERVER (AUTO-REACTIVE SYSTEM)
         * =========================================================
         * Automatically updates height when:
         * - Mobile menu opens/closes
         * - Announcement bar toggles
         * - Content changes
         */
        const header =
            document.querySelector<HTMLElement>('.site-header') ||
            document.querySelector<HTMLElement>('.blog-header');

        if (header && 'ResizeObserver' in window) {

            const observer = new ResizeObserver(() => {
                updateHeight();
            });

            observer.observe(header);
        }

    });


    /**
     * =========================================================
     * RESPONSIVE EVENTS
     * =========================================================
     */

    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);
}