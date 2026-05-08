/**
 * =========================================================
 * FAQ INTERACTIONS
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Handles accordion interactions for statically rendered FAQs.
 *
 * IMPORTANT
 * ---------------------------------------------------------
 * FAQ HTML is already rendered during build time.
 *
 * This file ONLY handles:
 * - expand/collapse interactions
 * - aria-expanded updates
 *
 * DOES NOT:
 * ---------------------------------------------------------
 * - render FAQ HTML
 * - inject templates
 * - clone DOM templates
 *
 * =========================================================
 */

export function initFAQInteractions() {

    /**
     * -----------------------------------------------------
     * GET ALL TRIGGERS
     * -----------------------------------------------------
     */

    const triggers =
        document.querySelectorAll<HTMLElement>(
            ".faq-trigger"
        )

    /**
     * -----------------------------------------------------
     * EMPTY STATE
     * -----------------------------------------------------
     */

    if (!triggers.length) {
        return
    }

    /**
     * -----------------------------------------------------
     * ATTACH EVENTS
     * -----------------------------------------------------
     */

    triggers.forEach((trigger) => {

        trigger.addEventListener("click", () => {

            /**
             * -------------------------------------------------
             * CURRENT ITEM
             * -------------------------------------------------
             */

            const item =
                trigger.closest(".faq-item")

            if (!item) return

            /**
             * -------------------------------------------------
             * CURRENT STATE
             * -------------------------------------------------
             */

            const isOpen =
                item.classList.contains("active")

            /**
             * -------------------------------------------------
             * CLOSE ALL ITEMS
             * -------------------------------------------------
             */

            document
                .querySelectorAll(".faq-item")
                .forEach((faqItem) => {

                    faqItem.classList.remove("active")

                    const button =
                        faqItem.querySelector<HTMLElement>(
                            ".faq-trigger"
                        )

                    if (button) {

                        button.setAttribute(
                            "aria-expanded",
                            "false"
                        )
                    }
                })

            /**
             * -------------------------------------------------
             * OPEN CLICKED ITEM
             * -------------------------------------------------
             */

            if (!isOpen) {

                item.classList.add("active")

                trigger.setAttribute(
                    "aria-expanded",
                    "true"
                )
            }
        })
    })
}