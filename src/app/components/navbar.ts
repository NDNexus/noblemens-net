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
    setupMobileDropdowns()
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
        toggle.classList.toggle("open") // Optional: animate toggle button
    })
}

/**
 * ----------------------------------------------------------
 * Mobile Dropdown Toggle (Products submenu)
 * ----------------------------------------------------------
 */
function setupMobileDropdowns(): void {
    const toggles = document.querySelectorAll<HTMLButtonElement>(".mobile-dropdown-toggle")

    toggles.forEach(toggle => {
        toggle.addEventListener("click", () => {
            const submenu = toggle.nextElementSibling as HTMLElement | null
            if (!submenu) return

            const isOpen = submenu.classList.contains("open")

            // Close all (optional - accordion behavior)
            document.querySelectorAll(".mobile-submenu").forEach(el => {
                el.classList.remove("open")
            })

            document.querySelectorAll(".mobile-dropdown-toggle").forEach(el => {
                el.classList.remove("open")
            })

            // Toggle current
            if (!isOpen) {
                submenu.classList.add("open")
                toggle.classList.add("open")
            }
        })
    })
}