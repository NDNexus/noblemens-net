/**
 * ==========================================================
 * GOOGLE ANALYTICS 4 ADAPTER
 * ==========================================================
 *
 * PURPOSE
 * ----------------------------------------------------------
 * Sends analytics events to Google Analytics 4.
 *
 * RESPONSIBILITIES
 * ----------------------------------------------------------
 * ✓ Initialize GA4
 * ✓ Send events
 * ✓ Hide the gtag.js implementation details
 *
 * MUST NOT
 * ----------------------------------------------------------
 * ✗ Contain business logic
 * ✗ Know about products, articles or WhatsApp
 * ✗ Be used directly outside the analytics module
 *
 * ==========================================================
 */

import { analyticsConfig } from './config';
import { debugError, debugLog, debugWarn } from './debug';
import type {
    AnalyticsParameters,
    AnalyticsProvider,
} from './types';

class GoogleAnalyticsProvider implements AnalyticsProvider {
    /**
     * Returns true when the Google Tag has been loaded.
     */
    public isReady(): boolean {
        return (
            analyticsConfig.enabled &&
            analyticsConfig.ga4.enabled &&
            typeof window !== 'undefined' &&
            typeof window.gtag === 'function'
        );
    }

    /**
     * Verifies that the Google Analytics provider is available.
     *
     * The Google Tag is loaded and configured by the official
     * gtag.js snippet included in the document head.
     *
     * This method validates the provider state and reports its
     * initialization status.
     */
    public initialize(): void {
        if (!analyticsConfig.enabled) {
            debugLog('Analytics is disabled.');
            return;
        }

        if (!analyticsConfig.ga4.enabled) {
            debugLog('Google Analytics is disabled.');
            return;
        }

        if (typeof window === 'undefined') {
            debugWarn('Google Analytics is unavailable (window is undefined).');
            return;
        }

        if (typeof window.gtag !== 'function') {
            debugWarn('Google Analytics is unavailable (gtag not found).');
            return;
        }

        debugLog(
            `Google Analytics initialized (${analyticsConfig.ga4.measurementId}).`
        );
    }

    /**
     * Sends an event to GA4.
     */
    public trackEvent(
        eventName: string,
        parameters: AnalyticsParameters = {}
    ): void {
        if (!this.isReady()) {
            debugWarn(
                `Skipped event "${eventName}" because Google Analytics is not ready.`
            );
            return;
        }

        try {
            window.gtag!(
                'event',
                eventName,
                {
                    ...parameters,
                    debug_mode: analyticsConfig.debug,
                }
            );

            debugLog(`Event sent: ${eventName}`, parameters);
        } catch (error) {
            debugError(
                `Failed to send event "${eventName}".`,
                error
            );
        }
    }
}

/**
 * Singleton GA4 provider.
 */
export const ga4Provider = new GoogleAnalyticsProvider();