/**
 * =========================================================
 * PORTABLE TEXT RENDERER (PRODUCTION READY)
 * =========================================================
 *
 * Converts Sanity Portable Text → HTML string
 *
 * Supports:
 * - Paragraphs
 * - Headings (h2, h3)
 * - Blockquotes
 * - Bullet & numbered lists (grouped)
 * - Bold, Italic, Underline
 * - Links (annotations)
 * - Custom callout blocks
 *
 * =========================================================
 */

import type {
    SanityPortableText,
    SanityPortableTextBlock,
    SanityPortableTextSpan,
    SanityCalloutBlock,
    SanityLinkAnnotation
} from '@/data/types/rawSanityData'


/**
 * =========================================================
 * TYPES
 * =========================================================
 */

type RendererOptions = {
    calloutWrapper?: string
    calloutMaxWidth?: string
}

type RenderContext = {
    html: string
    listBuffer: string[]
    currentListType: 'ul' | 'ol' | null
    options: RendererOptions
}

type Renderer = (block: any, ctx: RenderContext) => void


/**
 * =========================================================
 * PUBLIC API
 * =========================================================
 */

export function portableTextToHTML(
    blocks?: SanityPortableText[],
    options: RendererOptions = {}
): string {

    // Guard: invalid input
    if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
        console.error("[Portable Text Renderer]: Blocks are invalid. Please check input.");
        return ''
    }

    const ctx: RenderContext = {
        html: '',
        listBuffer: [],
        currentListType: null,
        options
    }

    for (const block of blocks) {
        if (!block || !block._type) continue

        const renderer = blockRenderers[block._type as keyof typeof blockRenderers]

        if (!renderer) continue

        try {
            (renderer as Renderer)(block, ctx)
        } catch (err) {
            console.error('PortableText render error:', err, block)
        }
    }

    flushList(ctx)

    return ctx.html.trim()
}

/**
 * =========================================================
 * RENDERER MAP
 * =========================================================
 */

const blockRenderers = {
    block: renderTextBlock,
    callout: renderCalloutBlock
}

/**
 * =========================================================
 * TEXT BLOCK RENDERER
 * =========================================================
 */

function renderTextBlock(
    block: SanityPortableTextBlock,
    ctx: RenderContext
) {

    const children = Array.isArray(block.children) ? block.children : []

    const text = children
        .map((child: SanityPortableTextSpan) =>
            renderSpan(child, block.markDefs)
        )
        .join('')

    // Skip empty blocks
    if (!text.trim()) return

    /**
     * -------------------------------
     * LIST ITEM HANDLING
     * -------------------------------
     */
    if (block.listItem === 'bullet' || block.listItem === 'number') {

        const listType = block.listItem === 'number' ? 'ol' : 'ul'

        // If switching list type → flush previous list
        if (ctx.currentListType && ctx.currentListType !== listType) {
            flushList(ctx)
        }

        ctx.currentListType = listType
        ctx.listBuffer.push(`<li class="mb-1">${text}</li>`)

        return
    }

    // Not a list → flush any existing list
    flushList(ctx)

    /**
     * -------------------------------
     * BLOCK STYLES
     * -------------------------------
     */
    switch (block.style) {

        case 'h2':
            ctx.html += `<h2 class="text-heading-lg mt-8 mb-4">${text}</h2>`
            break

        case 'h3':
            ctx.html += `<h3 class="text-heading-md mt-6 mb-3">${text}</h3>`
            break

        case 'h4':
            ctx.html += `<h4 class="text-heading-sm mt-4 mb-2">${text}</h4>`
            break
            
        case 'blockquote':
            ctx.html += `<blockquote class="border-l-2 pl-4 italic text-muted mb-4">${text}</blockquote>`
            break

        default:
            ctx.html += `<p class="mb-3 text-body">${text}</p>`
    }
}


/**
 * =========================================================
 * SPAN RENDERER (MARKS + LINKS)
 * =========================================================
 */

function renderSpan(
    child: SanityPortableTextSpan,
    markDefs: SanityLinkAnnotation[] = []
): string {

    if (!child || child._type !== 'span') return ''

    let content = child.text || ''

    /**
     * -------------------------------
     * DECORATORS
     * -------------------------------
     */
    if (child.marks?.includes('strong')) {
        content = `<strong>${content}</strong>`
    }

    if (child.marks?.includes('em')) {
        content = `<em>${content}</em>`
    }

    if (child.marks?.includes('underline')) {
        content = `<u>${content}</u>`
    }

    /**
     * -------------------------------
     * LINK ANNOTATIONS
     * -------------------------------
     */
    if (Array.isArray(child.marks) && Array.isArray(markDefs)) {

        child.marks.forEach((mark: string) => {
            const def = markDefs.find((d) => d._key === mark)

            if (def?._type === 'link' && def.href) {
                content = `<a href="${escapeHtml(def.href)}" target="_blank" rel="noopener noreferrer">${content}</a>`
            }
        })
    }

    return content
}


/**
 * =========================================================
 * CALLOUT BLOCK RENDERER
 * =========================================================
 */

function renderCalloutBlock(
    block: SanityCalloutBlock,
    ctx: RenderContext
) {

    // Always flush lists before rendering callout
    flushList(ctx)

    if (!block.content || !block.content.trim()) return

    const wrapperClass =
        ctx.options.calloutWrapper ||
        'flex items-center justify-center lg:justify-start py-4'

    const maxWidthClass =
        ctx.options.calloutMaxWidth ||
        'max-w-[80%]'

    ctx.html += `
        <div class="${wrapperClass}">
            <div class="callout callout-${block.type} ${maxWidthClass}">
                <div class="callout__content">
                    ${escapeHtml(block.content)}
                </div>
            </div>
        </div>
    `
}


/**
 * =========================================================
 * LIST FLUSH HANDLER
 * =========================================================
 */

function flushList(ctx: RenderContext) {

    if (ctx.listBuffer.length > 0 && ctx.currentListType) {

        ctx.html += `
            <${ctx.currentListType} class="mb-4 pl-4">
                ${ctx.listBuffer.join('')}
            </${ctx.currentListType}>
        `

        ctx.listBuffer = []
        ctx.currentListType = null
    }
}


/**
 * =========================================================
 * HTML ESCAPE (BASIC SAFETY)
 * =========================================================
 */

function escapeHtml(str: string): string {

    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}