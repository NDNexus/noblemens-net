import fs from "fs"
import path from "path"

/**
 * ==========================================================
 * Navbar State Injection Script
 * ==========================================================
 *
 * Iterates over all HTML files and injects the correct
 * active state into navbar links based on file path.
 *
 * Ensures:
 * - No frontend flicker
 * - SEO-correct markup
 *
 * ==========================================================
 */

const ROOT = "./"

/**
 * Recursively get all HTML files
 */
function getHTMLFiles(dir: string): string[] {
    let results: string[] = []
    const files = fs.readdirSync(dir)

    files.forEach(file => {
        const fullPath = path.join(dir, file)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
            if (["node_modules", "dist", "scripts"].includes(file)) return
            results = results.concat(getHTMLFiles(fullPath))
        } else if (file.endsWith(".html")) {
            results.push(fullPath)
        }
    })

    return results
}

/**
 * Inject active navbar state
 */
function injectNavbarState(html: string, filePath: string): string {
    let slug = filePath
        .replace(ROOT, "")
        .replace(/index\.html$/, "")
        .replace(/\.html$/, "")

    slug = slug === "" ? "/" : `/${slug}`

    return html.replace(
        /<a href="([^"]+)" class="navbar-link">/g,
        (match, href) => {
            const normalizedHref = href.replace(/\/$/, "") || "/"

            if (normalizedHref === slug) {
                return `<a href="${href}" class="navbar-link active" aria-current="page">`
            }

            return match
        }
    )
}

/**
 * Execute
 */
const files = getHTMLFiles(ROOT)

files.forEach(file => {
    let html = fs.readFileSync(file, "utf-8")
    html = injectNavbarState(html, file)
    fs.writeFileSync(file, html)

    console.log("✔ navbar updated:", file)
})

console.log("\n✅ Navbar state injected successfully.\n")