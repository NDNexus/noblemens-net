/**
 * ==========================================================
 * HEAD INCLUDE INJECTOR (FINAL - INCLUDE SYSTEM)
 * ==========================================================
 *
 * PURPOSE
 * -------
 * Ensures every HTML page contains:
 *
 * <include src="/templates/head.html"></include>
 *
 * inside <head>
 *
 * DOES NOT inline template.
 * Works with your Vite include plugin.
 *
 * SAFE:
 * -----
 * ✔ No duplication
 * ✔ Clean HTML
 * ✔ Works with SEO + schema includes
 *
 * ==========================================================
 */

import fs from "fs"
import path from "path"

const ROOT = "./"

const IGNORE_DIRS = ["node_modules", "dist", "templates", "scripts"]

const HEAD_INCLUDE =
  `<include src="/templates/head.html"></include>`

/**
 * Get all HTML files
 */
function getHTMLFiles(dir: string): string[] {

  let results: string[] = []

  const files = fs.readdirSync(dir)

  files.forEach(file => {

    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {

      if (IGNORE_DIRS.includes(file)) return

      results = results.concat(getHTMLFiles(fullPath))

    } else if (file.endsWith(".html")) {

      results.push(fullPath)
    }
  })

  return results
}

/**
 * Inject include safely
 */
function injectHead(filePath: string): void {

  let html = fs.readFileSync(filePath, "utf-8")

  /**
   * Ensure <head> exists
   */
  if (!/<head>/i.test(html)) {
    console.warn(`⚠️ No <head>: ${filePath}`)
    return
  }

  /**
   * Prevent duplication:
   * Check for include OR known head content
   */
  if (
    html.includes(HEAD_INCLUDE) ||
    html.includes("GLOBAL HEAD TEMPLATE")
  ) {
    return
  }

  /**
   * Inject include
   */
  const updated = html.replace(
    /<head>/i,
    `<head>\n  ${HEAD_INCLUDE}`
  )

  fs.writeFileSync(filePath, updated)

  console.log(`✔ Head include added → ${filePath}`)
}

/**
 * RUN
 */
const pages = getHTMLFiles(ROOT)

pages.forEach(injectHead)

console.log("\n✅ Head include injection completed.\n")