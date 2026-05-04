/**
 * =========================================================
 * TESTIMONIAL CAROUSEL
 * =========================================================
 */

type Testimonial = {
    content: string
    name: string
    subtitle?: string
}

/**
 * Create testimonial card HTML
 */
function createTestimonialCard(t: Testimonial): string {
    return `
        <div class="testimonial-item">

            <p class="text-body text-muted mb-6 leading-relaxed">
                “${t.content}”
            </p>

            <div class="mt-auto">
                <p class="text-heading-sm">${t.name}</p>
                ${t.subtitle ? `<p class="text-body-sm text-muted">${t.subtitle}</p>` : ""}
            </div>

        </div>
    `
}

/**
 * Main renderer
 */
export function renderTestimonials(testimonials: Testimonial[]) {

    const section = document.getElementById("testimonials-section")
    const track = document.getElementById("testimonials-track")
    const prevBtn = document.getElementById("testimonial-prev")
    const nextBtn = document.getElementById("testimonial-next")

    // ----------------------------------
    // Guard: hide if not enough data
    // ----------------------------------
    if (!section || !track || testimonials.length < 2) {
        if (section) section.style.display = "none"
        return
    }

    section.classList.remove("hidden")

    // ----------------------------------
    // Render cards
    // ----------------------------------
    track.innerHTML = testimonials.map(createTestimonialCard).join("")

    let index = 0

    /**
     * Responsive items per view
     */
    function getItemsPerView(): number {
        if (window.innerWidth >= 1024) return 3
        if (window.innerWidth >= 640) return 2
        return 1
    }

    /**
     * Calculate max scroll index
     */
    function getMaxIndex(): number {
        return Math.max(0, testimonials.length - getItemsPerView())
    }

    /**
     * Update transform
     */
    function updateCarousel() {
         if (!track) return   // ✅ guard FIRST
         
        const card = track.children[0] as HTMLElement
        if (!card) return

        const gap = 24 // matches gap-6
        const width = card.offsetWidth + gap

        track.style.transform = `translateX(-${index * width}px)`

        updateButtons()
    }

    /**
     * Disable buttons at edges
     */
    function updateButtons() {
        const max = getMaxIndex()

        prevBtn?.toggleAttribute("disabled", index === 0)
        nextBtn?.toggleAttribute("disabled", index >= max)
    }

    /**
     * Navigation
     */
    nextBtn?.addEventListener("click", () => {
        index = Math.min(index + 1, getMaxIndex())
        updateCarousel()
    })

    prevBtn?.addEventListener("click", () => {
        index = Math.max(index - 1, 0)
        updateCarousel()
    })

    /**
     * Resize handling (important)
     */
    let resizeTimeout: number

    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout)
        resizeTimeout = window.setTimeout(() => {
            index = Math.min(index, getMaxIndex())
            updateCarousel()
        }, 150)
    })

    // Init
    updateCarousel()
}