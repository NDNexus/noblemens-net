import fs from 'fs';
import path from 'path';

/**
 * =========================================================
 * NOBLEMENS DEV SCRIPT — ENSURE site-main CLASS
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Ensures every <main> tag across HTML files includes:
 *   class="site-main"
 *
 * - Adds class if missing
 * - Preserves existing classes
 * - Skips files without <main>
 *
 *
 * SCOPE
 * ---------------------------------------------------------
 * Scans entire project directory recursively
 * (excluding ignored folders)
 *
 *
 * USAGE
 * ---------------------------------------------------------
 * npm run fix:main
 *
 * =========================================================
 */


/* =========================================================
   CONFIG
========================================================= */

const ROOT_DIR = "./"

const IGNORE_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'templates',
];


/* =========================================================
   GET ALL HTML FILES (YOUR STRUCTURE)
========================================================= */

/**
 * Get all HTML files
 */
function getHTMLFiles(dir: string): string[] {

  let results: string[] = [];

  const files = fs.readdirSync(dir);

  files.forEach(file => {

    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {

      if (IGNORE_DIRS.includes(file)) return;

      results = results.concat(getHTMLFiles(fullPath));

    } else if (file.endsWith(".html")) {

      results.push(fullPath);
    }
  });

  return results;
}


/* =========================================================
   PROCESS FILE
========================================================= */

function processFile(filePath: string): void {

  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;

  /**
   * Match <main ...>
   */
  content = content.replace(/<main([^>]*)>/gi, (match, attrs) => {

    // If already has site-main → skip
    if (/class\s*=\s*["'][^"']*site-main[^"']*["']/i.test(attrs)) {
      return match;
    }

    // If class exists → append
    if (/class\s*=\s*["']([^"']*)["']/i.test(attrs)) {
      return match.replace(
        /class\s*=\s*["']([^"']*)["']/i,
        (_, classNames) => `class="${classNames} site-main"`
      );
    }

    // If no class → add one
    return `<main class="site-main"${attrs}>`;
  });

  /**
   * Write only if changed
   */
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✔ Updated: ${filePath}`);
  } else {
    console.log(`— No change: ${filePath}`);
  }
}


/* =========================================================
   RUN
========================================================= */

function run(): void {

  console.log('🔍 Scanning HTML files...\n');

  const files = getHTMLFiles(ROOT_DIR);

  if (files.length === 0) {
    console.log('⚠ No HTML files found.');
    return;
  }

  files.forEach(processFile);

  console.log('\n✅ Done.');
}

run();