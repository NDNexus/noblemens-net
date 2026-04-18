/**
 * ==========================================================
 * FORMAT POST (UI TRANSFORMATION LAYER)
 * ==========================================================
 *
 * PURPOSE
 * ----------------------------------------------------------
 * - Convert raw post data → UI-ready data
 * - Centralize all display logic
 * - Prevent UI components from handling raw/unsafe values
 *
 *
 * RESPONSIBILITIES
 * ----------------------------------------------------------
 * ✔ Normalize fields (title, description, etc.)
 * ✔ Format dates (smart / absolute)
 * ✔ Extract reading time safely
 * ✔ Provide safe defaults
 * ✔ Add derived flags (isNew, etc.)
 *
 *
 * NON-RESPONSIBILITIES
 * ----------------------------------------------------------
 * ✘ No DOM manipulation
 * ✘ No fetching
 * ✘ No side effects
 *
 *
 * DESIGN PRINCIPLES
 * ----------------------------------------------------------
 * ✔ Pure function
 * ✔ Deterministic output
 * ✔ Defensive (handles bad input)
 * ✔ Extensible
 *
 * ==========================================================
 */

import {
    formatSmartDate,
    formatDateTime,
    isFuture
} from "@lib/date";


/* =========================================================
   TYPES
========================================================= */

/**
 * Raw post (from build system / API)
 */
export interface RawPost {
    title?: string;
    description?: string;
    image?: string;

    date?: string | null;
    updated?: string | null;

    readingTime?: {
        minutes: number;
        words: number;
        text: string;
    };

    slug?: string;
    url?: string;

    category?: string;
    tags?: string[];

    hierarchy?: string[];
}


/**
 * UI-ready post
 */
export interface FormattedPost extends RawPost {
    /**
     * Safe fields
     */
    title: string;
    description: string;
    image: string;

    /**
     * Display fields
     */
    displayDate: string;
    displayDateTime: string;
    readingTimeText: string;

    categoryLabel: string;

    /**
     * Flags
     */
    isNew: boolean;
    isUpdated: boolean;
    isFuture: boolean;
}


/* =========================================================
   OPTIONS
========================================================= */

interface FormatPostOptions {
    /**
     * Number of days to consider a post "new"
     */
    newThresholdDays?: number;

    /**
     * Strict mode → throw on invalid critical data
     */
    strict?: boolean;
}


/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_NEW_THRESHOLD = 7;

/**
 * Format the category name for display
 * @param category 
 * @returns Capitalized category name with spaces (e.g. "web-development" → "Web Development")
 */
export function formatCategory(category?: string): string {
    if (!category) return "General";

    return category
        .replace(/-/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());
}

/* =========================================================
   CORE FUNCTION
========================================================= */

export function formatPost(
    post: RawPost,
    options: FormatPostOptions = {}
): FormattedPost {

    const {
        newThresholdDays = DEFAULT_NEW_THRESHOLD,
        strict = false
    } = options;


    /* -------------------------------------------------------
       BASIC VALIDATION
    ------------------------------------------------------- */

    if (!post || typeof post !== "object") {
        if (strict) {
            throw new Error("[formatPost] Invalid post object");
        }
        post = {};
    }


    /* -------------------------------------------------------
       SAFE NORMALIZATION
    ------------------------------------------------------- */

    const title = post.title?.trim() || "Untitled";
    const description = post.description?.trim() || "";
    const image = post.image || "";

    const date = post.date ?? null;
    const updated = post.updated ?? null;


    /* -------------------------------------------------------
       DATE FORMATTING
    ------------------------------------------------------- */

    let displayDate = "";
    let displayDateTime = "";
    let future = false;

    if (date) {
        try {
            displayDate = formatSmartDate(date);
            displayDateTime = formatDateTime(date);
            future = isFuture(date);
        } catch (err) {
            if (strict) {
                throw new Error(`[formatPost] Invalid date → ${date}`);
            }
        }
    }


    /* -------------------------------------------------------
       READING TIME
    ------------------------------------------------------- */

    const readingTimeText =
        post.readingTime?.text ||
        "";


    /* -------------------------------------------------------
       FLAGS
    ------------------------------------------------------- */

    let isNew = false;
    let isUpdated = false;

    if (date) {
        const diff = Date.now() - new Date(date).getTime();
        const days = diff / (1000 * 60 * 60 * 24);

        isNew = days <= newThresholdDays;
    }

    if (updated && date) {
        isUpdated = new Date(updated).getTime() > new Date(date).getTime();
    }


    /* -------------------------------------------------------
       RETURN FINAL OBJECT
    ------------------------------------------------------- */

    return {
        ...post,

        /**
         * SAFE FIELDS
         */
        title,
        description,
        image,

        /**
         * DISPLAY
         */
        displayDate,
        displayDateTime,
        readingTimeText,

        /**
         * FLAGS
         */
        isNew,
        isUpdated,
        isFuture: future,
        categoryLabel: formatCategory(post.category)
    };
}