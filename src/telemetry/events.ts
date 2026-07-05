/**
 * ==========================================================
 * ANALYTICS EVENTS
 * ==========================================================
 *
 * PURPOSE
 * ----------------------------------------------------------
 * Exposes the public analytics API used by the application.
 *
 * RESPONSIBILITIES
 * ----------------------------------------------------------
 * ✓ Translate business events into analytics events
 * ✓ Hide provider implementation details
 *
 * MUST NOT
 * ----------------------------------------------------------
 * ✗ Contain provider-specific logic
 * ✗ Call window.gtag() directly
 *
 * ==========================================================
 */

import { ga4Provider } from './ga4';
import type { AnalyticsParameters } from './types';

/**
 * Sends an analytics event to all enabled providers.
 *
 * This function is intended for internal use by the analytics
 * module. Application code should use the business-specific
 * tracking functions below.
 */
function trackEvent(
    eventName: string,
    parameters?: AnalyticsParameters
): void {
    ga4Provider.trackEvent(eventName, parameters);
}

/**
 * Tracks a product page view.
 */
export function trackProductViewed(
    productSlug: string
): void {
    trackEvent('product_viewed', {
        product_slug: productSlug,
    });
}

/**
 * Tracks an article being read.
 */
export function trackArticleRead(
    articleSlug: string
): void {
    trackEvent('article_read', {
        article_slug: articleSlug,
    });
}

/**
 * Tracks a WhatsApp click.
 */
export function trackWhatsAppClick(): void {
    trackEvent('whatsapp_click');
}

/**
 * Tracks a phone link click.
 */
export function trackPhoneClick(): void {
    trackEvent('phone_click');
}

/**
 * Tracks an email link click.
 */
export function trackEmailClick(): void {
    trackEvent('email_click');
}