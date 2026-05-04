
export function createWhatsAppLink({
    title,
    link,
    price
}: {
    title: string
    link: string
    price?: number
}) {
    const baseUrl = import.meta.env.VITE_SITE_URL
    console.log("[Create WhatsApp Link] Base URL: " + baseUrl)

    const fullLink = `${baseUrl}${link}`

    const message = `Hi,

I'm interested in:

*${title}*
${price ? `Price: ₹${price}` : ""}
${fullLink}

Please share more details.`

    return `https://wa.me/919193432784?text=${encodeURIComponent(message)}`
}