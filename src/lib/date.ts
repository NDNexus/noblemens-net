/**
 * ==========================================================
 * DATE & TIME UTILITIES (ENTERPRISE-GRADE)
 * ==========================================================
 *
 * FEATURES
 * ----------------------------------------------------------
 * ✔ Strict validation with optional error throwing
 * ✔ Full locale + timezone support
 * ✔ Relative + absolute formatting
 * ✔ Safe parsing
 * ✔ Extensible architecture
 *
 * ==========================================================
 */


/* =========================================================
   TYPES
========================================================= */

export type DateInput = string | number | Date;

interface BaseOptions {
    locale?: string;
    timeZone?: string;
    strict?: boolean;
}


/* =========================================================
   ERROR HANDLING
========================================================= */

class DateUtilError extends Error {
    constructor(message: string, input?: unknown) {
        super(`[DateUtil] ${message}${input ? ` → ${JSON.stringify(input)}` : ""}`);
        this.name = "DateUtilError";
    }
}


/* =========================================================
   CORE PARSER (CRITICAL)
========================================================= */

function parseDate(input?: DateInput, options?: BaseOptions): Date | null {
    const { strict = false } = options || {};

    if (input === null || input === undefined) {
        if (strict) throw new DateUtilError("Date input is missing", input);
        return null;
    }

    let date: Date;

    if (input instanceof Date) {
        date = input;
    } else if (typeof input === "string" || typeof input === "number") {
        date = new Date(input);
    } else {
        if (strict) throw new DateUtilError("Unsupported date input type", input);
        return null;
    }

    if (isNaN(date.getTime())) {
        if (strict) throw new DateUtilError("Invalid date value", input);
        return null;
    }

    return date;
}


/* =========================================================
   FORMATTERS
========================================================= */

export function formatDate(
    input?: DateInput,
    options: BaseOptions = {}
): string {
    const date = parseDate(input, options);
    if (!date) return "";

    const { locale = "en-IN", timeZone } = options;

    return new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone
    }).format(date);
}


export function formatTime(
    input?: DateInput,
    options: BaseOptions = {}
): string {
    const date = parseDate(input, options);
    if (!date) return "";

    const { locale = "en-IN", timeZone } = options;

    return new Intl.DateTimeFormat(locale, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone
    }).format(date);
}


export function formatDateTime(
    input?: DateInput,
    options: BaseOptions = {}
): string {
    const date = parseDate(input, options);
    if (!date) return "";

    return `${formatDate(date, options)}, ${formatTime(date, options)}`;
}


/* =========================================================
   RELATIVE DATE (TODAY / YESTERDAY / FALLBACK)
========================================================= */

export function getRelativeDate(
    input?: DateInput,
    options: BaseOptions = {}
): string {
    const date = parseDate(input, options);
    if (!date) return "";

    const now = new Date();

    const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const startOfTarget = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

    const diffDays = Math.floor(
        (startOfToday.getTime() - startOfTarget.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";

    return formatDate(date, options);
}


/* =========================================================
   RELATIVE TIME (INTL POWERED)
========================================================= */

export function getRelativeTime(
    input?: DateInput,
    options: BaseOptions = {}
): string {
    const date = parseDate(input, options);
    if (!date) return "";

    const { locale = "en-IN" } = options;

    const rtf = new Intl.RelativeTimeFormat(locale, {
        numeric: "auto"
    });

    const now = new Date();
    const diff = date.getTime() - now.getTime();

    const seconds = diff / 1000;

    if (Math.abs(seconds) < 60) {
        return rtf.format(Math.round(seconds), "second");
    }

    const minutes = seconds / 60;
    if (Math.abs(minutes) < 60) {
        return rtf.format(Math.round(minutes), "minute");
    }

    const hours = minutes / 60;
    if (Math.abs(hours) < 24) {
        return rtf.format(Math.round(hours), "hour");
    }

    const days = hours / 24;
    if (Math.abs(days) < 7) {
        return rtf.format(Math.round(days), "day");
    }

    return formatDate(date, options);
}


/* =========================================================
   SMART DISPLAY (UI-OPTIMIZED)
========================================================= */

export function formatSmartDate(
    input?: DateInput,
    options: BaseOptions = {}
): string {
    const date = parseDate(input, options);
    if (!date) return "";

    const relative = getRelativeDate(date, options);

    if (relative === "Today" || relative === "Yesterday") {
        return `${relative}, ${formatTime(date, options)}`;
    }

    return formatDate(date, options);
}


/* =========================================================
   UTILITIES (ADVANCED / FUTURE USE)
========================================================= */

/**
 * Returns ISO string safely
 */
export function toISO(input?: DateInput, options: BaseOptions = {}): string {
    const date = parseDate(input, options);
    if (!date) return "";

    return date.toISOString();
}


/**
 * Check if date is in future
 */
export function isFuture(input?: DateInput, options: BaseOptions = {}): boolean {
    const date = parseDate(input, options);
    if (!date) return false;

    return date.getTime() > Date.now();
}


/**
 * Check if date is today
 */
export function isToday(input?: DateInput, options: BaseOptions = {}): boolean {
    const date = parseDate(input, options);
    if (!date) return false;

    const now = new Date();

    return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
    );
}