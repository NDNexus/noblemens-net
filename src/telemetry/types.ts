/**
 * ==========================================================
 * ANALYTICS TYPES
 * ==========================================================
 *
 * PURPOSE
 * ----------------------------------------------------------
 * Shared types and interfaces used throughout the analytics
 * module.
 *
 * RESPONSIBILITIES
 * ----------------------------------------------------------
 * ✓ Define analytics contracts
 * ✓ Provide provider interfaces
 * ✓ Type global analytics objects
 *
 * MUST NOT
 * ----------------------------------------------------------
 * ✗ Contain business logic
 * ✗ Contain configuration
 * ✗ Depend on other analytics modules
 *
 * ==========================================================
 */

export type AnalyticsParameterValue =
  | string
  | number
  | boolean
  | null
  | undefined;

export type AnalyticsParameters = Record<
  string,
  AnalyticsParameterValue
>;

/**
 * Common interface implemented by analytics providers.
 */
export interface AnalyticsProvider {
  /**
   * Indicates whether the provider is ready to receive events.
   */
  isReady(): boolean;

  /**
   * Sends an analytics event.
   */
  trackEvent(
    eventName: string,
    parameters?: AnalyticsParameters
  ): void;
}

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set' | 'consent',
      target: string | Date,
      parameters?: AnalyticsParameters
    ) => void;
  }
}

export {};