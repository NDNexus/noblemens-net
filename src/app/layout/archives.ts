/**
 * ==========================================================
 * NOBLEMENS ARCHIVE SYSTEM (FRONTEND CLEAN VERSION)
 * ==========================================================
 *
 * PURPOSE
 * ----------------------------------------------------------
 * - Render blog archive
 * - Handle search, sort, pagination
 *
 * NOTE
 * ----------------------------------------------------------
 * - NO backend logic
 * - NO PageInfo dependency
 * - Pure frontend system
 *
 * ==========================================================
 */

import { posts } from "@data/posts";
import {
  createBlogCard
} from "@components/blogCard";

import { formatPost } from "@lib/formatPost";
import type { RawPost } from "@lib/formatPost";


/* =========================================================
   CONFIG
========================================================= */

const SETTINGS = {
  initialItems: {
    mobile: 4,
    tablet: 6,
    desktop: 9
  },
  loadMoreStep: 6
};

/* =========================================================
   STATE
========================================================= */

let filteredPosts: RawPost[] = [];
let visibleCount = 0;
let searchQuery = "";
let sortType = "latest";

/* =========================================================
   DEVICE
========================================================= */

function getDeviceType(): "mobile" | "tablet" | "desktop" {
  const width = window.innerWidth;

  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

/* =========================================================
   CORE FILTER LOGIC (SIMPLIFIED)
========================================================= */

function applyFilters(allPosts: any[]) {
  let result = [...allPosts];

  // SEARCH
  if (searchQuery.trim() !== "") {
    result = result.filter(post =>
      post.title.toLowerCase().includes(searchQuery) ||
      post.description.toLowerCase().includes(searchQuery)
    );
  }

  // SORT
  result.sort((a, b) => {
    if (sortType === "latest") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
  });

  return result;
}

/* =========================================================
   RENDER
========================================================= */

function render(grid: HTMLElement) {

  grid.innerHTML = "";

  console.log("POSTS:", posts.length)
  console.log("FILTERED POSTS:", filteredPosts.length)
  console.log("VISIBLE POSTS:", visibleCount)

  const visiblePosts = filteredPosts.slice(0, visibleCount);

 visiblePosts.forEach(post => {
  const formatted = formatPost(post);
  const card = createBlogCard(formatted);
  grid.appendChild(card);
});

  updateLoadMoreButton();
}

/* =========================================================
   LOAD MORE
========================================================= */

function updateLoadMoreButton() {
  const btn = document.getElementById("archive-load-more");

  if (!btn) return;

  btn.style.display =
    visibleCount >= filteredPosts.length ? "none" : "inline-block";
}

function setupLoadMore(grid: HTMLElement) {
  const btn = document.getElementById("archive-load-more");

  if (!btn) return;

  btn.addEventListener("click", () => {
    visibleCount += SETTINGS.loadMoreStep;
    render(grid);
  });
}

/* =========================================================
   CONTROLS
========================================================= */

function setupControls(grid: HTMLElement) {

  const searchInput = document.getElementById("archive-search") as HTMLInputElement;
  const sortSelect = document.getElementById("archive-sort") as HTMLSelectElement;

  function update() {
    filteredPosts = applyFilters(posts);
    visibleCount = Math.min(visibleCount, filteredPosts.length);
    render(grid);
  }

  // SEARCH
  searchInput?.addEventListener("input", (e: any) => {
    searchQuery = e.target.value.trim().toLowerCase();
    update();
  });

  // SORT
  sortSelect?.addEventListener("change", (e: any) => {
    sortType = e.target.value;
    update();
  });
}

/* =========================================================
   INIT
========================================================= */

export async function initArchive() {


  const grid = document.getElementById("archive-grid");
  if (!grid) return;

  
  /**
   * Initial state
   */
  const device = getDeviceType();
  visibleCount = SETTINGS.initialItems[device];

  filteredPosts = applyFilters(posts);

  /**
   * Setup UI
   */
  setupControls(grid);
  setupLoadMore(grid);

  /**
   * Initial render
   */
  render(grid);
}