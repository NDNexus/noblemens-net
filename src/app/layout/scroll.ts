/**
 * =========================================================
 * NOBLEMENS SCROLL SYSTEM
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Handles:
 * ✔ Smooth anchor scrolling with dynamic offset
 * ✔ Scroll spy (active section highlighting)
 *
 * Designed for:
 * - Fixed headers
 * - Optional TOC (Table of Contents)
 * - Design-system-based spacing (CSS variables)
 *
 * ---------------------------------------------------------
 *
 * CORE FEATURES
 * ---------------------------------------------------------
 * 1. Offset-aware scrolling
 *    - Accounts for header height
 *    - Accounts for TOC (if present)
 *    - Accounts for layout spacing (--space-md)
 *
 * 2. Scroll spy
 *    - Highlights active section link
 *    - Works with data-scroll-link attribute
 *
 * ---------------------------------------------------------
 *
 * REQUIREMENTS
 * ---------------------------------------------------------
 * ✔ Sections must have IDs
 * ✔ Links must use href="#section-id"
 * ✔ CSS variables must exist:
 *
 *   --header-height
 *   --toc-offset
 *   --space-md
 *
 * ---------------------------------------------------------
 *
 * OPTIONAL (SCROLL SPY)
 * ---------------------------------------------------------
 * <a href="#benefits" data-scroll-link>Benefits</a>
 *
 * Active class:
 * .is-active
 *
 * =========================================================
 */


/* =========================================================
   INTERNAL UTIL — SPACING CALCULATION (CACHED)
========================================================= */

/**
 * Cached spacing value (in px)
 * Prevents repeated DOM calculations
 */
let cachedSpace: number | null = null;

/**
 * Get spacing value from CSS variable (--space-md)
 *
 * Supports:
 * ✔ rem (fast path)
 * ✔ px
 * ✔ clamp(), calc() (fallback via DOM)
 *
 * Runs once → cached for performance
 */
function getSpacingPx(): number {

    if (cachedSpace !== null) return cachedSpace;

    const root = document.documentElement;
    const styles = getComputedStyle(root);

    const raw = styles.getPropertyValue('--space-md').trim();

    /**
     * FAST PATH → REM
     */
    if (raw.endsWith('rem')) {
        const value = parseFloat(raw);
        const rootFontSize = parseFloat(styles.fontSize) || 16;

        cachedSpace = value * rootFontSize;
        return cachedSpace;
    }

    /**
     * FALLBACK → DOM MEASUREMENT
     * Handles clamp(), calc(), etc.
     */
    const temp = document.createElement('div');
    temp.style.height = raw;
    root.appendChild(temp);

    cachedSpace = temp.offsetHeight;

    root.removeChild(temp);

    return cachedSpace;
}


/* =========================================================
   OFFSET CALCULATION
========================================================= */

/**
 * Compute scroll offset for anchor navigation
 *
 * Includes:
 * - Header height
 * - TOC offset (dynamic)
 * - Layout spacing
 */
function getScrollOffset(): number {

    const root = document.documentElement;
    const styles = getComputedStyle(root);

    const header = parseFloat(styles.getPropertyValue('--header-height')) || 0;
    const toc = parseFloat(styles.getPropertyValue('--toc-offset')) || 0;

    const space = getSpacingPx();

    return header + toc + space;
}


/* =========================================================
   SMOOTH SCROLL HANDLER
========================================================= */

/**
 * Handles click on anchor links
 * Applies smooth scrolling with offset correction
 */
function handleAnchorClick(e: Event): void {

    const target = e.target as HTMLElement | null;
    if (!target) return;

    const link = target.closest('a[href^="#"]') as HTMLAnchorElement | null;
    if (!link) return;

    const id = link.getAttribute('href');
    if (!id || id === '#') return;

    const section = document.querySelector<HTMLElement>(id);
    if (!section) return;

    e.preventDefault();

    const offsetTop =
        section.getBoundingClientRect().top + window.scrollY;

    const offset = getScrollOffset();

    window.scrollTo({
        top: offsetTop - offset,
        behavior: 'smooth',
    });
}


/* =========================================================
   SCROLL SPY (ACTIVE LINK TRACKING)
========================================================= */

/**
 * Highlights active section link based on scroll position
 */
function initScrollSpy(): void {

    const links = document.querySelectorAll<HTMLAnchorElement>(
        'a[data-scroll-link]'
    );

    if (links.length === 0) return;

    /**
     * Map links → sections
     */
    const sections = Array.from(links)
        .map(link => {
            const id = link.getAttribute('href');
            if (!id) return null;
            return document.querySelector<HTMLElement>(id);
        })
        .filter(Boolean) as HTMLElement[];

    /**
     * Scroll handler
     */
    function onScroll(): void {

        const scrollPos = window.scrollY + getScrollOffset() + 10;

        let currentSection: HTMLElement | null = null;

        for (const section of sections) {
            if (section.offsetTop <= scrollPos) {
                currentSection = section;
            }
        }

        links.forEach(link => {
            link.classList.remove('is-active');

            const id = link.getAttribute('href');
            if (!id || !currentSection) return;

            if (currentSection.id === id.replace('#', '')) {
                link.classList.add('is-active');
            }
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    onScroll(); // Initial run
}


/* =========================================================
   INIT
========================================================= */

/**
 * Initialize scroll system
 *
 * Safe to run globally — activates only when needed
 */
export function initScrollSystem(): void {

    document.addEventListener('click', handleAnchorClick);

    initScrollSpy();
}