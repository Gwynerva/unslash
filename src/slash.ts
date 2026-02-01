import type { SlashPattern } from './pattern.js';

/**
 * Formats a string based on the given slash pattern.
 * @param pattern
 * A string of letters or their negations (prefixed with "!").
 * Each letter represents a specific formatting rule:
 * - `t` | `!t`: Ensure trailing slash is added | removed.
 * - `l` | `!l`: Ensure leading slash is added | removed.
 * - `f` | `!f`: Force forward | backward slashes.
 * - `c` Collapse multiple adjacent slashes into a single slash.
 *
 * Example patterns:
 * - `"tlfc"`: Ensure leading and trailing slashes, force forward slashes, collapse multiple slashes.
 * - `"lf"`: Force forward slashes and ensure leading slash (trailing might be present or absent).
 * - `tl!f`: Ensure leading and trailing slashes, force backward slashes.
 * @param parts
 * The string parts to be formatted according to the specified pattern.
 * They will be joined together using forward slashes by default (or backward slashes if `!f` is specified in the pattern).
 * @returns
 * The formatted string with slash-concatenated parts according to the specified slash pattern.
 * Protocols (like `http://`) are preserved and not altered by the formatting.
 */
export function slash<S extends string>(
  pattern: SlashPattern<S>,
  ...parts: string[]
): string {
  const flags: Record<string, boolean> = {};

  // @ts-expect-error Pattern is validated at compile-time
  pattern = pattern as string;

  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];
    const negated = char === '!';
    const flag = negated ? pattern[i + 1] : char;

    flags[flag] = !negated;

    if (negated) {
      i++;
    }
  }

  const slashChar = flags['f'] === false ? '\\' : '/';

  // ------------------------------------------------------------
  // Protocol-safe join
  // ------------------------------------------------------------

  let joined = parts.join(slashChar);

  // Matches: scheme: or scheme://
  // Examples: http://, file://, mailto:
  const PROTOCOL_RE = /^([a-zA-Z][a-zA-Z\d+\-.]*:)(\/\/)?/;

  let protocol = '';
  const match = joined.match(PROTOCOL_RE);

  if (match) {
    protocol = match[0];
    joined = joined.slice(protocol.length);
  }

  // ------------------------------------------------------------
  // Force slash type (convert all slashes)
  // ------------------------------------------------------------

  if (flags['f'] === false) {
    // Force backward slashes: convert all / to \
    joined = joined.replace(/\//g, '\\');
  } else if (flags['f'] === true) {
    // Force forward slashes: convert all \ to /
    joined = joined.replace(/\\/g, '/');
  }

  // ------------------------------------------------------------
  // Collapse multiple slashes
  // ------------------------------------------------------------

  if (flags['c']) {
    const slashRegex = flags['f'] === false ? /\\+/g : /\/+/g;
    const replacement = flags['f'] === false ? '\\' : '/';
    joined = joined.replace(slashRegex, replacement);
  }

  // ------------------------------------------------------------
  // Leading slash handling
  // ------------------------------------------------------------

  if (flags['l']) {
    if (!joined.startsWith(slashChar)) {
      joined = slashChar + joined;
    }
  } else {
    while (joined.startsWith('\\') || joined.startsWith('/')) {
      joined = joined.slice(1);
    }
  }

  // ------------------------------------------------------------
  // Trailing slash handling
  // ------------------------------------------------------------

  if (flags['t']) {
    if (!joined.endsWith(slashChar)) {
      joined = joined + slashChar;
    }
  } else {
    while (joined.endsWith('\\') || joined.endsWith('/')) {
      joined = joined.slice(0, -1);
    }
  }

  return protocol + joined;
}

/**
 * Shortened version of `slash`.
 */
export const s = slash;
