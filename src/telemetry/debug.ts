/**
 * ==========================================================
 * ANALYTICS DEBUG
 * ==========================================================
 *
 * PURPOSE
 * ----------------------------------------------------------
 * Provides development-only logging utilities for the
 * analytics module.
 *
 * RESPONSIBILITIES
 * ----------------------------------------------------------
 * ✓ Log analytics activity during development
 * ✓ Keep production consoles clean
 *
 * MUST NOT
 * ----------------------------------------------------------
 * ✗ Contain analytics logic
 * ✗ Send analytics events
 *
 * ==========================================================
 */

import { analyticsConfig } from './config';

const PREFIX = '[Analytics]';

/**
 * Logs an informational message.
 */
export function debugLog(message: string, ...data: readonly unknown[]): void {
  if (!analyticsConfig.debug) {
    return;
  }

  console.log(PREFIX, message, ...data);
}

/**
 * Logs a warning.
 */
export function debugWarn(message: string, ...data: readonly unknown[]): void {
  if (!analyticsConfig.debug) {
    return;
  }

  console.warn(PREFIX, message, ...data);
}

/**
 * Logs an error.
 */
export function debugError(message: string, ...data: readonly unknown[]): void {
  if (!analyticsConfig.debug) {
    return;
  }

  console.error(PREFIX, message, ...data);
}