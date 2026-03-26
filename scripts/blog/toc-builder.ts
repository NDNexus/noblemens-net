/**
 * ==========================================================
 * TOC BUILDER ENGINE (NESTED • PRODUCTION)
 * ==========================================================
 *
 * PURPOSE
 * ----------------------------------------------------------
 * Converts HTML into:
 * ✔ Updated content (with heading IDs)
 * ✔ Nested TOC structure (hierarchical)
 *
 * Supports:
 * ✔ Infinite nesting (h1–h6)
 * ✔ Config-driven inclusion rules
 * ✔ Future UX (expand/collapse, VS Code style)
 *
 * ==========================================================
 */

import { tocConfig } from "./toc-config"

/**
 * ==========================================================
 * TYPES
 * ==========================================================
 */

interface TocNode {
    id: string
    text: string
    level: number
    children: TocNode[]
}

/**
 * ==========================================================
 * MAIN BUILDER
 * ==========================================================
 */

export function buildTOC(html: string): {
    content: string
    toc: string
} {

    const headingRegex = /<h([1-6])>(.*?)<\/h\1>/g;

    let updatedContent = html;

    const root: TocNode = {
        id: "root",
        text: "",
        level: 0,
        children: []
    }

    const stack: TocNode[] = [root];

    let match;

    while ((match = headingRegex.exec(html)) !== null) {

        const level = parseInt(match[1]);
        let text = match[2];

        /**
         * Skip unwanted levels
         */
        if (!tocConfig.levels.includes(level)) continue;

        /**
         * Marker detection
         */
        const hasIncludeMarker = text.includes(tocConfig.marker);
        const hasExcludeMarker = text.includes(tocConfig.excludeMarker);

        let include = false;

        if (tocConfig.mode === "all") include = true;
        if (tocConfig.mode === "marked") include = hasIncludeMarker;
        if (tocConfig.mode === "mixed") include = !hasExcludeMarker;

        if (hasIncludeMarker) include = true;

        /**
         * Clean text
         */
        const cleanText = text
            .replace(tocConfig.marker, "")
            .replace(tocConfig.excludeMarker, "")
            .trim();

        /**
         * Generate ID
         */
        const id = tocConfig.slugify(cleanText);

        /**
         * Replace heading with ID
         */
        const original = match[0];
        const replacement = `<h${level} id="${id}">${cleanText}</h${level}>`;

        updatedContent = updatedContent.replace(original, replacement);

        /**
         * Skip if not included in TOC
         */
        if (!include) continue;

        /**
         * Create node
         */
        const node: TocNode = {
            id,
            text: cleanText,
            level,
            children: []
        };

        /**
         * STACK LOGIC (core of nesting)
         */
        while (stack.length > 1 && stack[stack.length - 1].level >= level) {
            stack.pop();
        }

        stack[stack.length - 1].children.push(node);
        stack.push(node);
    }

    /**
     * Generate HTML from tree
     */
    const tocHtml = renderTOC(root.children);

    return {
        content: updatedContent,
        toc: tocHtml
    };
}

/**
 * ==========================================================
 * RENDER TREE → HTML
 * ==========================================================
 */

function renderTOC(nodes: TocNode[]): string {

    return nodes.map(node => {

        const hasChildren = node.children.length > 0;

        return `
<div class="toc-item level-${node.level} ${hasChildren ? "has-children" : ""}">

  <div class="toc-row">

    ${hasChildren ? `<button class="toc-expand" data-toc-expand></button>` : `<span class="toc-spacer"></span>`}

    <a href="#${node.id}" data-scroll-link>
      ${node.text}
    </a>

  </div>

  ${hasChildren ? `<div class="toc-children">${renderTOC(node.children)}</div>` : ""}

</div>
    `;

    }).join("");
}