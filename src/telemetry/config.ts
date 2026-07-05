/**
 * ==========================================================
 * ANALYTICS CONFIGURATION
 * ==========================================================
 *
 * PURPOSE
 * ----------------------------------------------------------
 * Central configuration for analytics providers.
 *
 * RESPONSIBILITIES
 * ----------------------------------------------------------
 * ✓ Define provider settings
 * ✓ Define debug settings
 * ✓ Store measurement IDs
 *
 * MUST NOT
 * ----------------------------------------------------------
 * ✗ Contain business logic
 * ✗ Initialize providers
 * ✗ Send analytics events
 *
 * ==========================================================
 */

export interface AnalyticsConfig {
    enabled: boolean;
    debug: boolean;

    ga4: {
        enabled: boolean;
        measurementId: string;
    };
}

/**
 * Analytics configuration.
 *
 * Environment-specific overrides can be added in the future
 * without changing the public analytics API.
 */
export const analyticsConfig: AnalyticsConfig = {
    enabled: true,

    // Enable verbose logging during development.
    debug: import.meta.env.DEV,

    ga4: {
        enabled: true,
        measurementId: 'G-TFMD38QD0Y',
    },
};