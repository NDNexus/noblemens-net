import fs from "fs";
import path from "path";

/**
 * ==========================================================
 * 404 PAGE GENERATOR (CLOUDFLARE COMPATIBLE)
 * ==========================================================
 *
 * PURPOSE
 * ----------------------------------------------------------
 * Cloudflare Pages serves /404.html automatically for
 * non-existent routes.
 *
 * This script copies the existing "page-not-found" page
 * into the required 404.html location.
 *
 * ==========================================================
 */

const source = path.resolve("dist/page-not-found/index.html");
const target = path.resolve("dist/404.html");

try {
    if (!fs.existsSync(source)) {
        throw new Error("❌ Source 404 page not found: " + source);
    }

    fs.copyFileSync(source, target);

    console.log("✅ 404.html generated successfully.");
} catch (error) {
    console.error("❌ Failed to generate 404 page.");
    console.error(error);
    process.exit(1);
}