/**
 * ==========================================================
 * ANALYTICS INITIALIZATION
 * ==========================================================
 *
 * PURPOSE
 * ----------------------------------------------------------
 * Initializes analytics providers during application startup.
 *
 * RESPONSIBILITIES
 * ----------------------------------------------------------
 * ✓ Verify provider availability
 * ✓ Log initialization status
 *
 * MUST NOT
 * ----------------------------------------------------------
 * ✗ Send analytics events
 * ✗ Contain business logic
 *
 * ==========================================================
 */

import { analyticsConfig } from './config';
import { debugLog } from './debug';
import { ga4Provider } from './ga4';

/**
 * Initializes all enabled analytics providers.
 *
 * Safe to call once during application startup.
 */
export function initializeAnalytics(): void {
    if (!analyticsConfig.enabled) {
        debugLog('Analytics is disabled.');
        return;
    }

    if (analyticsConfig.ga4.enabled) {
        ga4Provider.initialize();
        
    }

    debugLog('All Analytics initialized.');
}