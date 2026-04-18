/**
 * ==========================================================
 * CARD META RENDERER (PRODUCTION GRADE)
 * ==========================================================
 *
 * PURPOSE
 * ----------------------------------------------------------
 * Render flexible metadata rows for cards (blog, product, etc.)
 *
 * FEATURES
 * ----------------------------------------------------------
 * ✔ Supports dynamic meta items
 * ✔ Supports text, SVG, and HTMLElement separators
 * ✔ Handles empty values automatically
 * ✔ Fully reusable across components
 * ✔ Clean DOM generation (no string concatenation hacks)
 *
 *
 * SUPPORTED SEPARATORS
 * ----------------------------------------------------------
 * ✔ Plain text ("•", "|", "/")
 * ✔ Inline SVG (string)
 * ✔ HTMLElement (custom node)
 *
 *
 * DESIGN PRINCIPLES
 * ----------------------------------------------------------
 * ✔ Data-driven UI
 * ✔ Separation of concerns
 * ✔ No hardcoded layout logic in components
 *
 * ==========================================================
 */


/* =========================================================
   TYPES
========================================================= */

/**
 * Single meta item
 */
export interface MetaItem {
    label: string;
    className?: string;
}

/**
 * Separator can be:
 * - text (•)
 * - SVG string (<svg>...</svg>)
 * - HTMLElement (custom node)
 */
type Separator = string | HTMLElement;

interface RenderMetaOptions {
    separator?: Separator;
}


/* =========================================================
   CORE FUNCTION
========================================================= */

/**
 * Render meta items into container
 *
 * @param container - Target DOM element
 * @param items - Array of meta items
 * @param options - Separator configuration
 */
export function renderMeta(
    container: HTMLElement,
    items: MetaItem[],
    options: RenderMetaOptions = {}
): void {

    if (!container) return;

    const { separator = "•" } = options;

    /**
     * Filter out empty items
     */
    const validItems = items.filter(item => item.label);

    /**
     * Clear existing content
     */
    container.innerHTML = "";

    validItems.forEach((item, index) => {

        /**
         * Create meta item
         */
        const span = document.createElement("span");
        span.textContent = item.label;

        if (item.className) {
            span.className = item.className;
        }

        container.appendChild(span);

        /**
         * Add separator (except last item)
         */
        if (index < validItems.length - 1) {

            let sepEl: HTMLElement;

            if (typeof separator === "string") {

                /**
                 * Detect HTML / SVG string
                 */
                if (separator.trim().startsWith("<")) {
                    const wrapper = document.createElement("span");
                    wrapper.innerHTML = separator.trim();

                    sepEl = wrapper.firstElementChild as HTMLElement;
                } else {
                    /**
                     * Plain text separator
                     */
                    sepEl = document.createElement("span");
                    sepEl.textContent = ` ${separator} `;
                }

            } else {
                /**
                 * Clone HTMLElement separator
                 */
                sepEl = separator.cloneNode(true) as HTMLElement;
            }

            /**
             * Apply standard class
             */
            sepEl.classList.add("meta-separator");

            container.appendChild(sepEl);
        }
    });
}