import type { SlashPattern } from './pattern.js';
import { slash } from './slash.js';

/**
 * Creates a slash formatter with a fixed pattern for multiple uses.
 * @param pattern
 * See `slash` function for pattern documentation.
 */
export function slashFn<S extends string>(pattern: SlashPattern<S>) {
  return (...parts: string[]) => slash(pattern, ...parts);
}

/** Shortened version of `slashFn`. */
export const sfn = slashFn;
