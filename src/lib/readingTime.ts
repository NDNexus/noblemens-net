/**
 * ==========================================================
 * READING TIME UTILITY (PRODUCTION GRADE)
 * ==========================================================
 *
 * PURPOSE
 * ----------------------------------------------------------
 * - Calculate reading time from raw text / markdown
 * - Handle edge cases (empty, invalid input)
 * - Return structured + formatted output
 *
 * ==========================================================
 */

export interface ReadingTimeResult {
    minutes: number;
    words: number;
    text: string; // "3 min read"
}

interface ReadingTimeOptions {
    wordsPerMinute?: number;
    strict?: boolean;
}


/* =========================================================
   CORE FUNCTION
========================================================= */

export function getReadingTime(
    input?: string,
    options: ReadingTimeOptions = {}
): ReadingTimeResult {

    const { wordsPerMinute = 200, strict = false } = options;

    if (input === null || input === undefined) {
        if (strict) {
            throw new Error("[ReadingTime] Input text is missing");
        }

        return {
            minutes: 0,
            words: 0,
            text: "0 min read"
        };
    }

    if (typeof input !== "string") {
        if (strict) {
            throw new Error("[ReadingTime] Input must be a string");
        }

        return {
            minutes: 0,
            words: 0,
            text: "0 min read"
        };
    }

    /**
     * CLEAN TEXT (remove markdown + HTML)
     */
    const cleanText = input
        .replace(/<[^>]*>/g, "")         // remove HTML
        .replace(/[#_*`~>-]/g, "")       // remove markdown symbols
        .replace(/\[(.*?)\]\(.*?\)/g, "$1") // links → text
        .replace(/\s+/g, " ")            // normalize spaces
        .trim();

    if (!cleanText) {
        return {
            minutes: 0,
            words: 0,
            text: "0 min read"
        };
    }

    /**
     * WORD COUNT
     */
    const words = cleanText.split(" ").length;

    /**
     * TIME CALCULATION
     */
    const minutes = Math.ceil(words / wordsPerMinute);

    return {
        minutes,
        words,
        text: `${minutes} min read`
    };
}