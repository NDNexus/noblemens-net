/**
 * =========================================================
 * NOBLEMENS TOC SYSTEM — INTERACTION ENGINE
 * =========================================================
 *
 * FEATURES
 * ---------------------------------------------------------
 * ✔ Nested expand / collapse (VS Code style)
 * ✔ Global TOC collapse / expand
 * ✔ Hide / show TOC
 * ✔ Mobile-aware behavior
 *
 * ARCHITECTURE
 * ---------------------------------------------------------
 * State is controlled via:
 *
 * body.toc-hidden
 * body.toc-collapsed
 * .toc-item.expanded
 *
 * JS only toggles classes
 * CSS handles layout
 *
 * =========================================================
 */

/* =========================================================
   TOC OFFSET SYSTEM (🔥 CRITICAL)
========================================================= */

/**
 * Calculates TOC height and exposes it as CSS variable:
 * --toc-offset
 *
 * Used by scroll system for correct anchor positioning
 */
function updateTOCOffset(): void {

    const toc = document.querySelector<HTMLElement>('.toc');

    if (!toc) {
        document.documentElement.style.setProperty('--toc-offset', '0px');
        return;
    }

    /**
     * If TOC is hidden → no offset
     */
    if (document.body.classList.contains('toc-hidden')) {
        document.documentElement.style.setProperty('--toc-offset', '0px');
        return;
    }

    /**
     * If tablet landscape → TOC is sidebar → no vertical offset needed
     */
    if (window.innerWidth > 768) {
        document.documentElement.style.setProperty('--toc-offset', '0px');
        return;
    }

    /**
     * Mobile → TOC is top-sticky
     */
    const height = toc.offsetHeight;

    document.documentElement.style.setProperty(
        '--toc-offset',
        `${height}px`
    );
}

function initTOCOffsetSystem(): void {

    updateTOCOffset();

    window.addEventListener('resize', updateTOCOffset);

    /**
     * React to TOC state changes
     */
    const observer = new MutationObserver(() => {
        updateTOCOffset();
    });

    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });
}

function isMobile(): boolean {
    return window.innerWidth <= 768;
}

/* =========================================================
   NESTED EXPAND / COLLAPSE
========================================================= */

function initNestedToggles(): void {

    const buttons = document.querySelectorAll<HTMLElement>('[data-toc-expand]');

    buttons.forEach(button => {

        button.addEventListener('click', (e) => {

            e.stopPropagation();

            const item = button.closest('.toc-item');
            if (!item) return;

            item.classList.toggle('expanded');

        });

    });
}

/* =========================================================
   GLOBAL COLLAPSE / EXPAND
========================================================= */

function initGlobalToggle(): void {

    const toggleBtn = document.querySelector('[data-toc-toggle]');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {

        document.body.classList.toggle('toc-collapsed');

    });
}

/* =========================================================
   HIDE TOC
========================================================= */

function initHide(): void {

    const hideBtn = document.querySelector('[data-toc-hide]');
    if (!hideBtn) return;

    hideBtn.addEventListener('click', () => {

        document.body.classList.add('toc-hidden');

    });
}

/* =========================================================
   SHOW TOC (FROM HEADER)
========================================================= */

function initShow(): void {

    const showBtn = document.querySelector('[data-toc-open]');
    if (!showBtn) return;

    showBtn.addEventListener('click', () => {

        document.body.classList.remove('toc-hidden');

    });
}

/* =========================================================
   MOBILE AUTO-CLOSE ON LINK CLICK
========================================================= */

function initMobileAutoClose(): void {

    const links = document.querySelectorAll<HTMLAnchorElement>('.toc a');

    links.forEach(link => {

        link.addEventListener('click', () => {

            if (!isMobile()) return;

            /**
             * Collapse instead of full hide
             */
            document.body.classList.add('toc-collapsed');

        });

    });
}

/* =========================================================
   INITIAL STATE SETUP
========================================================= */

function setInitialState(): void {

    if (isMobile()) {
        document.body.classList.add('toc-collapsed');
    } else {
        document.body.classList.remove('toc-collapsed');
    }

}

/* =========================================================
   INIT
========================================================= */

export function initTOC(): void {

    setInitialState();

    initNestedToggles();
    initGlobalToggle();
    initHide();
    initShow();
    initMobileAutoClose();
    initTOCOffsetSystem();


}