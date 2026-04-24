/**
 * ==========================================================
 * POSTS DATA LAYER (PRODUCTION GRADE)
 * ==========================================================
 *
 * PURPOSE
 * ----------------------------------------------------------
 * Central API for querying blog posts
 *
 * FEATURES
 * ----------------------------------------------------------
 * ✔ Latest / Oldest sorting
 * ✔ Get by slug
 * ✔ Filter by category (supports nested via hierarchy)
 * ✔ High performance (single sort, minimal copies)
 * ✔ CMS-ready (future Sanity integration)
 *
 * DESIGN PRINCIPLES
 * ----------------------------------------------------------
 * ✔ Pure functions (no DOM)
 * ✔ Immutable data
 * ✔ Predictable outputs
 *
 * ==========================================================
 */

import { posts } from "@data/posts-database";

/* =========================================================
   TYPES
========================================================= */

export type Post = typeof posts[number];

type SortType = "latest" | "oldest";

/* =========================================================
   CORE SORT
========================================================= */

function sortPosts(data: Post[], sort: SortType = "latest"): Post[] {
    const sorted = [...data].sort((a, b) => {
        const diff =
            new Date(a.date).getTime() - new Date(b.date).getTime();

        return sort === "latest" ? -diff : diff;
    });

    return sorted;
}

/* =========================================================
   CORE FILTER — HIERARCHY BASED
========================================================= */

/**
 * Check if post belongs to category path
 *
 * Example:
 * category = "vinegars"
 * matches:
 * ["articles", "vinegars", ...]
 *
 * category = "apple-cider-vinegar"
 * matches:
 * ["articles", "vinegars", "apple-cider-vinegar", ...]
 */
function matchesCategory(post: Post, category: string): boolean {
    return post.hierarchy.includes(category);
}

/* =========================================================
   PUBLIC API
========================================================= */

/**
 * Get latest posts
 */
export function getLatestPosts(limit?: number): Post[] {
    const sorted = sortPosts(posts, "latest");
    return limit ? sorted.slice(0, limit) : sorted;
}

/**
 * Get oldest posts
 */
export function getOldestPosts(limit?: number): Post[] {
    const sorted = sortPosts(posts, "oldest");
    return limit ? sorted.slice(0, limit) : sorted;
}

/**
 * Get post by slug
 */
export function getPostBySlug(slug: string): Post | undefined {
    return posts.find(p => p.slug === slug);
}

/**
 * Get posts by category (hierarchy-based)
 */
export function getPostsByCategory(options?: {
    category?: string;
    limit?: number;
    sort?: SortType;
}): Post[] {

    const {
        category,
        limit,
        sort = "latest"
    } = options || {};

    /**
     * If no category → return all posts
     */
    let result = !category || category === "all"
        ? [...posts]
        : posts.filter(post => matchesCategory(post, category));

    /**
     * Sort
     */
    result = sortPosts(result, sort);

    /**
     * Limit
     */
    return limit ? result.slice(0, limit) : result;
}

/**
 * Generic query (future-proof)
 */
export function queryPosts(options?: {
    category?: string;
    limit?: number;
    sort?: SortType;
    tags?: string[];
}): Post[] {

    const {
        category,
        limit,
        sort = "latest",
        tags
    } = options || {};

    let result = [...posts];

    /**
     * Category filter
     */
    if (category && category !== "all") {
        result = result.filter(post => matchesCategory(post, category));
    }

    /**
     * Tag filter
     */
    if (tags && tags.length > 0) {
        result = result.filter(post =>
            tags.some(tag => post.tags.includes(tag))
        );
    }

    /**
     * Sort
     */
    result = sortPosts(result, sort);

    /**
     * Limit
     */
    return limit ? result.slice(0, limit) : result;
}