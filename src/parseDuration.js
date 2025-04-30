// ./src/parseDuration.js

const timeMultipliers = {
    ms: 1,
    s: 1000,
    m: 60_000,
    h: 3_600_000,
  };
  
  /**
   * Parses a duration string like "2s", "1.5m", "500ms" into milliseconds.
   * Also accepts raw number values (treated as ms).
   * @param {string|number} input
   * @returns {number}
   */
  export function parseDuration(input) {
    if (typeof input === 'number' && Number.isFinite(input)) {
      return input;
    }
  
    if (typeof input !== 'string') {
      throw new TypeError(`Expected a duration string or number, got ${typeof input}`);
    }

    input = input.toLowerCase().trim();

    const match = input.match(/^(\d+(?:\.\d+)?)\s*(ms|s|m|h)$/);

    if (!match) {
      throw new Error(
        `Invalid duration format: "${input}". Expected formats like "500ms", "2s", "1.5m", or "1h".`
      );
    }
  
    const [, value, unit] = match;
    return parseFloat(value) * timeMultipliers[unit];
  }