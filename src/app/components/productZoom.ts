/**
 * Product Image Zoom (Apple-style) — FINAL
 * ----------------------------------------
 * Fixes:
 * - Page scroll works normally
 * - Zoom activates only on tap (mobile)
 * - Drag works only when zoomed
 * - Smooth premium easing
 */

export function initProductZoom(): void {

    console.log("[ProductZoom] Initializing...");
    
    const container = document.getElementById("zoom-container") as HTMLElement | null;
    const image = document.getElementById("main-image") as HTMLImageElement | null;

    if (!container || !image) {
        console.error("[ProductZoom] Initialization failed:");

        if (!container) {
            console.error("❌ Missing element: #zoom-container");
        }

        if (!image) {
            console.error("❌ Missing element: #main-image");
        }

        return;
    }

    const img = image;

    let isZoomed = false;
    let isDragging = false;

    let startX = 0;
    let startY = 0;

    let currentX = 50;
    let currentY = 50;

    let targetX = 50;
    let targetY = 50;

    // -----------------------------------
    // Smooth animation loop (easing)
    // -----------------------------------
    const animate = () => {
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;

        img.style.transformOrigin = `${currentX}% ${currentY}%`;

        requestAnimationFrame(animate);
    };
    animate();

    // -----------------------------------
    // DESKTOP: Hover zoom
    // -----------------------------------
    container.addEventListener("mouseenter", () => {
        if (window.innerWidth > 768) {
            container.classList.add("zoom-active");
            isZoomed = true;
        }
    });

    container.addEventListener("mouseleave", () => {
        container.classList.remove("zoom-active");
        isZoomed = false;

        targetX = 50;
        targetY = 50;
    });

    container.addEventListener("mousemove", (e: MouseEvent) => {
        if (!isZoomed || window.innerWidth <= 768) return;

        const rect = container.getBoundingClientRect();

        targetX = ((e.clientX - rect.left) / rect.width) * 100;
        targetY = ((e.clientY - rect.top) / rect.height) * 100;
    });

    // -----------------------------------
    // MOBILE: Tap to zoom (AND enable drag)
    // -----------------------------------
    container.addEventListener("click", (e: MouseEvent) => {
        if (window.innerWidth > 768) return;

        const rect = container.getBoundingClientRect();

        if (!isZoomed) {
            // Zoom at tap position
            targetX = ((e.clientX - rect.left) / rect.width) * 100;
            targetY = ((e.clientY - rect.top) / rect.height) * 100;

            container.classList.add("zoom-active");
            isZoomed = true;

            // 🔥 Disable scroll ONLY when zoomed
            container.style.touchAction = "none";
        } else {
            // Reset
            container.classList.remove("zoom-active");
            isZoomed = false;

            targetX = 50;
            targetY = 50;

            // 🔥 Re-enable scroll
            container.style.touchAction = "auto";
        }
    });

    // -----------------------------------
    // TOUCH: Start drag
    // -----------------------------------
    container.addEventListener("touchstart", (e: TouchEvent) => {
        if (!isZoomed) return;

        isDragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });

    // -----------------------------------
    // TOUCH: Drag pan
    // -----------------------------------
    container.addEventListener("touchmove", (e: TouchEvent) => {
        if (!isDragging || !isZoomed) return;

        e.preventDefault(); // works only when touchAction = none

        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;

        targetX -= dx * 0.25;
        targetY -= dy * 0.25;

        targetX = Math.max(0, Math.min(100, targetX));
        targetY = Math.max(0, Math.min(100, targetY));

        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });

    // -----------------------------------
    // TOUCH: End drag
    // -----------------------------------
    container.addEventListener("touchend", () => {
        isDragging = false;
    });
}