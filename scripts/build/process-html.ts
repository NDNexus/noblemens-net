import { execSync } from "child_process"

/**
 * ==========================================================
 * HTML Build Pipeline
 * ==========================================================
 *
 * Orchestrates all HTML processing steps in a controlled,
 * sequential manner.
 *
 * Each step is executed as an isolated script to ensure:
 * - Modularity
 * - Debuggability
 * - Fail-safe execution
 *
 * ==========================================================
 */

/**
 * Run a step safely
 */
function runStep(name: string, command: string) {
  console.log(`\n🔧 Running: ${name}...\n`)

  try {
    execSync(command, { stdio: "inherit" })
    console.log(`\n✅ ${name} completed.`)
  } catch (error) {
    console.error(`\n❌ ${name} failed.`)
    process.exit(1)
  }
}

/**
 * ----------------------------------------------------------
 * Execution Pipeline
 * ----------------------------------------------------------
 *
 * Order matters:
 * 1. Head Injection → ensures base HTML structure
 * 2. Navbar State → sets active navigation (no flicker)
 * 3. SEO Generation → meta tags
 * 4. Schema Generation → structured data
 * ----------------------------------------------------------
 */

runStep("Blog Build", "npx tsx scripts/blog/build-blog.ts")

runStep("Head Injection", "npx tsx scripts/html/inject-head.ts")

runStep("Navbar State Injection", "npx tsx scripts/html/inject-navbar-state.ts")

runStep("SEO Generation", "npx tsx scripts/seo/generate-seo.ts")

runStep("Schema Generation", "npx tsx scripts/schema/generate-schema.ts")

// runStep("Head Cleanup", "npx tsx scripts/clean-head.ts")

console.log("\n🚀 HTML build process completed successfully.\n")