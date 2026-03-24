/**
 * =========================================================
 * NOBLEMENS LAYOUT SYSTEM — SCROLL & ANCHOR HANDLING
 * =========================================================
 *
 * FEATURES
 * ---------------------------------------------------------
 * 1. Smooth anchor scrolling with header offset
 * 2. Scroll spy (active section highlighting)
 *
 *
 * REQUIREMENTS
 * ---------------------------------------------------------
 * - Sections must have IDs
 * - Links must use href="#section-id"
 * - Header height system must be active
 *
 *
 * OPTIONAL (for active state)
 * ---------------------------------------------------------
 * Add attribute:
 *   data-scroll-link
 *
 * Example:
 * <a href="#benefits" data-scroll-link>Benefits</a>
 *
 * Active class:
 *   .is-active
 *
 * =========================================================
 */

function getScrollOffset(): number {

    const root = document.documentElement;
    const styles = getComputedStyle(root);

    const header = parseFloat(styles.getPropertyValue('--header-height')) || 0;

    const temp = document.createElement('div');
    temp.style.height = styles.getPropertyValue('--space-md');
    root.appendChild(temp);

    const spaceLg = temp.offsetHeight;
    root.removeChild(temp);

    return header + spaceLg;
}

/* =========================================================
   SMOOTH SCROLL HANDLER
========================================================= */

function handleAnchorClick(e: Event): void {
    const target = e.target as HTMLElement;
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
   SCROLL SPY (ACTIVE LINK)
========================================================= */

function initScrollSpy(): void {
    const links = document.querySelectorAll<HTMLAnchorElement>(
        'a[data-scroll-link]'
    );

    if (links.length === 0) return;

    const sections = Array.from(links)
        .map(link => {
            const id = link.getAttribute('href');
            if (!id) return null;
            return document.querySelector<HTMLElement>(id);
        })
        .filter(Boolean) as HTMLElement[];

    function onScroll(): void {
        const scrollPos = window.scrollY + getScrollOffset() + 10;

        let currentSection: HTMLElement | null = null;

        sections.forEach(section => {
            if (section.offsetTop <= scrollPos) {
                currentSection = section;
            }
        });

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

    onScroll(); // initial run
}


/* =========================================================
   INIT
========================================================= */

export function initScrollSystem(): void {
    document.addEventListener('click', handleAnchorClick);
    initScrollSpy();
}