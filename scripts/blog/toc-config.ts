/**
 * ==========================================================
 * TOC CONFIGURATION SYSTEM
 * ==========================================================
 *
 * PURPOSE
 * ----------------------------------------------------------
 * Controls how the Table of Contents (TOC) is generated
 * across all blog posts.
 *
 * This file is the ONLY place you need to edit to change:
 * - Which headings are included
 * - Whether TOC is automatic or manual
 * - Marker behavior
 *
 * No changes required in builder logic.
 *
 * ==========================================================
 *
 * CORE CONCEPTS
 * ----------------------------------------------------------
 *
 * 1. LEVELS
 *    Which heading levels are eligible (h1–h6)
 *
 * 2. MODE
 *    How headings are selected
 *
 * 3. MARKERS
 *    Manual control inside markdown content
 *
 * ==========================================================
 *
 * MODES EXPLAINED
 * ----------------------------------------------------------
 *
 * "all"
 *   → Include ALL headings matching levels
 *
 * "marked"
 *   → Include ONLY headings with [toc]
 *
 * "mixed" (RECOMMENDED)
 *   → Include all headings by default
 *   → Allow exclusion with [no-toc]
 *   → Allow forced inclusion with [toc]
 *
 * ==========================================================
 *
 * MARKER SYSTEM
 * ----------------------------------------------------------
 *
 * You can control TOC directly in markdown:
 *
 * ## Benefits
 *   → included (default in "mixed")
 *
 * ## Notes [no-toc]
 *   → excluded
 *
 * ## Important [toc]
 *   → always included
 *
 * ==========================================================
 *
 * DESIGN PRINCIPLES
 * ----------------------------------------------------------
 *
 * ✔ Content-driven control
 * ✔ No script modification required
 * ✔ Safe defaults
 * ✔ Easy to extend
 *
 * ==========================================================
 */

export type TocMode = "all" | "marked" | "mixed";

export interface TocConfig {
    /**
     * Heading levels to include
     * Example: [2, 3] → h2 + h3
     */
    levels: number[];

    /**
     * Selection mode
     */
    mode: TocMode;

    /**
     * Marker to FORCE include a heading
     */
    marker: string;

    /**
     * Marker to EXCLUDE a heading
     */
    excludeMarker: string;

    /**
     * Slug generator for heading IDs
     */
    slugify: (text: string) => string;
}


/**
 * ==========================================================
 * DEFAULT CONFIG (USED IN PRODUCTION)
 * ==========================================================
 */

export const tocConfig: TocConfig = {

    /**
     * Default: include H2 + H3
     * This is ideal for blog readability
     */
    levels: [2, 3],

    /**
     * Recommended mode:
     * - Auto include headings
     * - Allow manual control when needed
     */
    mode: "mixed",

    /**
     * Marker for inclusion
     */
    marker: "[toc]",

    /**
     * Marker for exclusion
     */
    excludeMarker: "[no-toc]",

    /**
     * Slug generator (used for IDs)
     */
    slugify: (text: string): string => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")   // remove special chars
            .trim()
            .replace(/\s+/g, "-");         // spaces → dash
    }
};