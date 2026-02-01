// #region Slash
//

function _slash(pattern: RegExp): SlashFormatter;
function _slash(pattern: RegExp, ...parts: string[]): string;
function _slash(...parts: string[]): string;
function _slash(
  ...args: [RegExp | string, ...string[]] | string[]
): string | SlashFormatter {
  const [first, ...rest] = args;

  //
  // slash("a", "b")
  //

  if (typeof first === 'string') {
    return (args as string[]).join('/');
  }

  //
  // slash(/pattern/)
  //

  if (first instanceof RegExp && rest.length === 0) {
    const config = parsePattern(first);
    return createFormatter(config);
  }

  //
  // slash(/pattern/, "a", "b")
  //

  if (first instanceof RegExp) {
    return applyConfig(parsePattern(first), rest as string[]);
  }

  return '';
}

//
// #endregion

// #region Helpers
//

type SlashFormatter = {
  (pattern: RegExp): SlashFormatter;
  (...parts: string[]): string;
  (pattern: RegExp, ...parts: string[]): string;
};

type SlashConfig = {
  f?: boolean;
  c?: boolean;
  t?: boolean;
  l?: boolean;
};

function createFormatter(config: SlashConfig): SlashFormatter {
  const formatter = ((
    ...inner: [RegExp | string, ...string[]] | string[]
  ): string | SlashFormatter => {
    const [head, ...tail] = inner;

    // Append pattern
    if (head instanceof RegExp) {
      const nextConfig = parsePattern(head);
      const combined = mergeConfigs(config, nextConfig);

      // pattern + strings → evaluate immediately
      if (tail.length > 0) {
        return applyConfig(combined, tail as string[]);
      }

      // pattern only → return new formatter
      return createFormatter(combined);
    }

    // formatter("a", "b")
    return applyConfig(config, inner as string[]);
  }) as SlashFormatter;

  return formatter;
}

function parsePattern(pattern: RegExp): SlashConfig {
  const source = pattern.source;
  const config: SlashConfig = {};

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    const negated = char === '!';
    const flag = negated ? source[i + 1] : char;

    if (negated) i++;

    switch (flag) {
      case 'f':
      case 'c':
      case 't':
      case 'l':
        config[flag] = !negated;
        break;
    }
  }

  return config;
}

function mergeConfigs(a: SlashConfig, b: SlashConfig): SlashConfig {
  return { ...a, ...b };
}

function applyConfig(config: SlashConfig, parts: string[]): string {
  const slashChar = config.f === false ? '\\' : '/';
  //
  // Protocol-safe join
  //

  let joined = parts.join(slashChar);

  const PROTOCOL_RE = /^([a-zA-Z][a-zA-Z\d+\-.]*:)(\/\/)?/;

  let protocol = '';
  const match = joined.match(PROTOCOL_RE);

  if (match) {
    protocol = match[0];
    joined = joined.slice(protocol.length);
  }

  //
  // Force slash type
  //

  if (config.f === false) {
    joined = joined.replace(/\//g, '\\');
  } else if (config.f === true) {
    joined = joined.replace(/\\/g, '/');
  }

  //
  // Collapse multiple slashes
  //

  if (config.c) {
    const slashRegex = config.f === false ? /\\+/g : /\/+/g;
    joined = joined.replace(slashRegex, slashChar);
  }

  //
  // Trailing slash
  //

  if (config.t) {
    if (!joined.endsWith(slashChar)) {
      joined += slashChar;
    }
  } else if (config.t === false) {
    // Explicitly removed (!t)
    while (joined.endsWith('/') || joined.endsWith('\\')) {
      joined = joined.slice(0, -1);
    }
  }

  //
  // Leading slash
  //

  if (config.l) {
    if (!joined.startsWith(slashChar)) {
      joined = slashChar + joined;
    }
  } else if (config.l === false) {
    // Explicitly removed (!l)
    while (joined.startsWith('/') || joined.startsWith('\\')) {
      joined = joined.slice(1);
    }
  }

  return protocol + joined;
}

//
// #endregion

// #region Exports
//

/**
 * Creates a slash formatter or formats strings directly.
 *
 * The formatter is configured using a RegExp pattern whose source consists of
 * single-letter flags and their negations (`!x`). Flags are evaluated
 * left-to-right; later flags override earlier ones (e.g. `c!c` disables
 * collapsing even if `c` appeared before).
 *
 * Supported flags:
 * - `t` | `!t` — ensure trailing slash is added | removed
 * - `l` | `!l` — ensure leading slash is added | removed
 * - `f` | `!f` — force forward | backward slashes
 * - `c` | `!c` — collapse multiple slashes | do not collapse
 *
 * Calling with a RegExp returns a reusable formatter.
 * Calling a formatter with another RegExp appends flags to the existing pattern.
 *
 * @example
 * const normalize = slasher(/fc/); // Force forward slashes, collapse multiple slashes
 * normalize(/t/, 'my\\long\\\\path'); // `fc` flags + force trailing slash and apply formatting
 * // → 'my/long/path/'
 */
export const slash = _slash;

/** Short version of `slash`. */
export const s = slash;

/** Convert to forward slashes + collapse multiple adjacent slashes. */
export const snormalize = slash(/fc/);

/** Short version of `snormalize`. */
export const sn = snormalize;

export default slash;

//
// #endregion
