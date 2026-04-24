/**
 * ==========================================================
 * RENDER LATEST POSTS (DOM RENDERER)
 * ==========================================================
 *
 * PURPOSE
 * ----------------------------------------------------------
 * Convert post data into UI and inject into DOM
 *
 * ==========================================================
 */

import { getLatestPosts } from "@data/posts";
import { createBlogCard } from "@components/blogCard";
import { formatPost } from "@lib/formatPost";

export function renderLatestPosts(
    container: HTMLElement,
    limit: number = 6
) {
    if (!container) return;

    /**
     * Get data
     */
    const posts = getLatestPosts(limit);

    /**
     * Clear container
     */
    container.innerHTML = "";

    /**
     * Render
     */
    const fragment = document.createDocumentFragment();

    posts.forEach(post => {
        try {
            const formatted = formatPost(post);
            const card = createBlogCard(formatted);
            fragment.appendChild(card);
        } catch (error) {
            console.error("Failed to render post:", post, error);
        }
    });

    container.appendChild(fragment);
}