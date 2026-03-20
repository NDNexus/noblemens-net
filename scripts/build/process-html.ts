import { execSync } from "child_process"

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
 */

runStep("Head Injection", "npx tsx scripts/html/inject-head.ts")

runStep("SEO Generation", "npx tsx scripts/seo/generate-seo.ts")

runStep("Schema Generation", "npx tsx scripts/schema/generate-schema.ts")

// runStep("Head Cleanup", "npx tsx scripts/clean-head.ts")

console.log("\n🚀 HTML build process completed successfully.\n")