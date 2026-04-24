/**
 * ==========================================================
 * VITE CONFIG — NOBLEMENS SYSTEM (PRODUCTION + DEV CONSISTENT)
 * ==========================================================
 *
 * WHAT THIS CONFIG DOES
 * ---------------------
 *
 * 1. Auto-detects ALL HTML pages (multi-page app)
 * 2. Supports clean URLs (/about-us instead of /about-us/index.html)
 * 3. Uses .buildignore to control build scope
 * 4. Ensures DEV, PREVIEW, and PRODUCTION behave the SAME
 * 5. Supports scalable structure (products, blog, categories)
 *
 * ==========================================================
 */

import { defineConfig } from "vite";
import type { Plugin } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import htmlInclude from "./plugins/htmlInclude";
import micromatch from "micromatch";

/**
 * ==========================================================
 * PATH SETUP
 * ==========================================================
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ==========================================================
 * LOAD .buildignore
 * ==========================================================
 */

function loadIgnoreList(): string[] {
  const ignoreFile = path.resolve(__dirname, ".buildignore");

  if (!fs.existsSync(ignoreFile)) return [];

  return fs
    .readFileSync(ignoreFile, "utf-8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

/**
 * ==========================================================
 * IGNORE MATCHING LOGIC
 * ==========================================================
 */

function shouldIgnore(relativePath: string, ignoreList: string[]): boolean {
  return micromatch.isMatch(relativePath, ignoreList);
}

/**
 * ==========================================================
 * HTML SCANNER (AUTO PAGE DETECTION)
 * ==========================================================
 */

function getHtmlInputs(
  dir: string,
  base = "",
  ignoreList: string[] = []
): Record<string, string> {
  const entries: Record<string, string> = {};

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relativePath = path.join(base, file);

    if (shouldIgnore(relativePath, ignoreList)) continue;

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      Object.assign(
        entries,
        getHtmlInputs(fullPath, relativePath, ignoreList)
      );
    } else if (file.endsWith(".html")) {
      const name = relativePath.replace(/\.html$/, "");
      entries[name] = fullPath;
    }
  }

  return entries;
}

/**
 * ==========================================================
 * CLEAN URL REWRITE PLUGIN (CRITICAL)
 * ==========================================================
 *
 * This ensures:
 *
 * /about-us → /about-us/index.html
 *
 * Works for:
 * ✔ npm run dev
 * ✔ npm run preview
 *
 * Without this:
 * ❌ Vite serves index.html (homepage fallback)
 */

function cleanUrlRewrite(): Plugin {
  return {
    name: "clean-url-rewrite",

    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (!req.url) return next();

        const url = req.url;

        // 🔥 Ignore Vite internal paths
        if (
          url.startsWith("/@") ||
          url.startsWith("/src/") ||
          url.startsWith("/node_modules/") ||
          url.startsWith("/images/") ||
          url.startsWith("/favicons/")
        ) {
          return next();
        }

        // Ignore files with extension
        if (url.includes(".")) return next();

        const cleanUrl = url.replace(/\/$/, "").replace(/^\//, "");
        const filePath = path.join(__dirname, cleanUrl, "index.html");

        if (fs.existsSync(filePath)) {
          req.url = `/${cleanUrl}/index.html`;
        } else {
          req.url = "/page-not-found/index.html";
        }
        next();
      });
    },

    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (!req.url) return next();

        const url = req.url;

        if (
          url.startsWith("/@") ||
          url.startsWith("/assets/") ||
          url.startsWith("/images/") ||
          url.startsWith("/favicons/")
        ) {
          return next();
        }

        if (url.includes(".")) return next();

        const cleanUrl = url.replace(/\/$/, "").replace(/^\//, "");
        const filePath = path.join(__dirname, cleanUrl, "index.html");

        if (fs.existsSync(filePath)) {
          req.url = `/${cleanUrl}/index.html`;
        } else {
          req.url = "/page-not-found/index.html";
        }

        next();
      });
    },
  };
}

/**
 * ==========================================================
 * LOAD IGNORE RULES
 * ==========================================================
 */

const ignoreList = loadIgnoreList();

/**
 * ==========================================================
 * EXPORT CONFIG
 * ==========================================================
 */

export default defineConfig({
  plugins: [
    tailwindcss(),
    htmlInclude(),

    // 🔥 MUST BE LAST
    cleanUrlRewrite(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@css": path.resolve(__dirname, "./src/css"),
      "@utils": path.resolve(__dirname, "./scripts/utils"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@components": path.resolve(__dirname, "./src/app/components"),
      "@app-layout": path.resolve(__dirname, "./src/app/layout"),
      "@css-layout": path.resolve(__dirname, "./src/css/layout"),
      "@html": path.resolve(__dirname, "./scripts/html"),
      "@data": path.resolve(__dirname, "./src/data"),
      "@templates": path.resolve(__dirname, "./templates"),
      "@render": path.resolve(__dirname, "./src/app/render"),
    },
  },

  /**
   * ==========================================================
   * DEV SERVER
   * ==========================================================
   */

  server: {
    host: "noblemens-net.local",
    port: 5173,
    strictPort: true,
  },

  /**
   * ==========================================================
   * PREVIEW SERVER
   * ==========================================================
   */

  preview: {
    host: "noblemens-net.local",
    port: 4173,
    strictPort: true,
  },

  /**
   * ==========================================================
   * BUILD CONFIG
   * ==========================================================
   */

  build: {
    rollupOptions: {
      input: getHtmlInputs(__dirname, "", ignoreList),
    },
  },
});