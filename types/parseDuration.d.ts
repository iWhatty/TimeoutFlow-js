/**
 * Parses a duration string like "2s", "1.5m", "500ms" into milliseconds.
 * Also accepts raw number values (treated as ms).
 * @param {string|number} input
 * @returns {number}
 */
export function parseDuration(input: string | number): number;
