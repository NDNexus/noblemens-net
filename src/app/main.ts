import "@css/main.css";

// Register Iconify web component
import 'iconify-icon'

// Replace <i icon="..."> with <iconify-icon>
/**
 * <iconify-icon icon="tabler:home"></iconify-icon> can now be written as:
    <i icon="tabler:home"></i>
 */
document.querySelectorAll('i[icon]').forEach((el) => {

    // Get icon name
    const name = el.getAttribute('icon')

    // Create Iconify element
    const icon = document.createElement('iconify-icon')

    // Assign icon name
    icon.setAttribute('icon', name || '')

    // Copy all classes from <i> to the icon
    icon.className = el.className

    // Replace original element
    el.replaceWith(icon)

});

/**
 * Mobile menu toggle
 */
const toggle = document.getElementById("menu-toggle")
const menu = document.getElementById("mobile-menu")

if (toggle && menu) {
  toggle.addEventListener("click", () => {
    menu.classList.toggle("hidden")
  })
}