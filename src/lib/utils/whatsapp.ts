/**
 * =========================================================
 * CREATE WHATSAPP LINK
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Generates a professional WhatsApp inquiry link
 * for product ordering and customer inquiries.
 *
 * SUPPORTS
 * ---------------------------------------------------------
 * - Product title
 * - Variant label
 * - Product URL
 * - Product pricing
 * - Product image preview link
 *
 * IMPORTANT
 * ---------------------------------------------------------
 * WhatsApp does NOT support embedded images directly
 * inside message payloads.
 *
 * HOWEVER:
 * - direct image URLs WILL generate previews
 * - product page URLs may also generate OG previews
 *
 * BEST PRACTICE
 * ---------------------------------------------------------
 * Ensure:
 * - product pages have Open Graph images
 * - variant images are publicly accessible
 *
 * =========================================================
 */

export function createWhatsAppLink({
    title,
    urlPath,
    price,
    variantLabel
}: {
    title: string
    urlPath: string
    price?: number
    variantLabel?: string
    
}) {

    /**
     * -----------------------------------------------------
     * SITE URL
     * -----------------------------------------------------
     */

    const baseUrl =
        import.meta.env.VITE_SITE_URL || ""

    /**
     * -----------------------------------------------------
     * CLEAN FINAL PRODUCT URL
     * -----------------------------------------------------
     */

    const fullLink =
        `${baseUrl.replace(/\/$/, "")}${urlPath}`

    /**
     * -----------------------------------------------------
     * PRODUCT LABEL
     * -----------------------------------------------------
     */

    const productLabel =
        variantLabel
            ? `${title} (${variantLabel})`
            : title

    /**
     * -----------------------------------------------------
     * PROFESSIONAL MESSAGE
     * -----------------------------------------------------
     */

    const message = `Assalamu Alaikum,

I would like to inquire about the following product from Noblemens:

*${productLabel}*

${price ? `Price: ₹${price}` : ""}

Product Link:
${fullLink}

Please share availability and further details.

JazakAllahu Khair.`

    /**
     * -----------------------------------------------------
     * FINAL WHATSAPP URL
     * -----------------------------------------------------
     */

    return `https://wa.me/919193432784?text=${encodeURIComponent(message)}`
}