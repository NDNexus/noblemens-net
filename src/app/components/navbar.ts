/**
 * ==========================================================
 * Navbar Controller
 * ==========================================================
 *
 * Handles:
 * - Active link detection (based on current URL)
 * - Mobile menu toggle
 * - Mobile dropdown toggle
 *
 * Designed for:
 * - Static HTML + include-based architecture
 * - Vite-powered frontend
 *
 * Author: Nadeem System
 * ==========================================================
 */

export function initNavbar(): void {
    setActiveLink()
    setupMobileMenu()
    setupDropdowns()
}

/**
 * ----------------------------------------------------------
 * Active Link Logic
 * ----------------------------------------------------------
 * Matches current pathname with navbar links
 */
function setActiveLink(): void {
    const currentPath = normalizePath(window.location.pathname)

    const links = document.querySelectorAll<HTMLAnchorElement>(".navbar-link")

    links.forEach(link => {
        const href = normalizePath(link.getAttribute("href") || "")

        if (!href) return

        if (href === currentPath) {
            link.classList.add("active")
            link.setAttribute("aria-current", "page")
        }
    })
}

/**
 * Normalize paths:
 * "/about-us/" → "/about-us"
 */
function normalizePath(path: string): string {
    return path.replace(/\/$/, "") || "/"
}

/**
 * ----------------------------------------------------------
 * Mobile Menu Toggle
 * ----------------------------------------------------------
 */
function setupMobileMenu(): void {
    const toggle = document.getElementById("menu-toggle")
    const mobileMenu = document.getElementById("mobile-menu")

    if (!toggle || !mobileMenu) return

    toggle.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden")
    })
}

/**
 * ----------------------------------------------------------
 * Dropdown Handling (Mobile Only)
 * ----------------------------------------------------------
 */
function setupDropdowns(): void {
    const dropdowns = document.querySelectorAll<HTMLElement>(".dropdown")

    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector<HTMLAnchorElement>("a")
        const submenu = dropdown.querySelector<HTMLElement>(".submenu")

        if (!trigger || !submenu) return

        trigger.addEventListener("click", (e) => {
            if (window.innerWidth < 768) {
                e.preventDefault()
                submenu.classList.toggle("hidden")
            }
        })
    })
}