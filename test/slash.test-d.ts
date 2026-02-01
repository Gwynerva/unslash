import { describe, it } from 'vitest';

import { slash } from '@src/slash.js';

describe('slash', () => {
  it('should not error for valid patterns', () => {
    slash('tlfc', 'path', 'to', 'file');
    slash('!tlfc', 'path', 'to', 'file');
    slash('t!lfc', 'path', 'to', 'file');
    slash('', 'path', 'to', 'file');
  });

  it('should error for invalid patterns', () => {
    // @ts-expect-error 'z' is not a valid flag
    slash('tz', 'path', 'to', 'file');
    // @ts-expect-error 'x' is not a valid flag
    slash('!x', 'path', 'to', 'file');
    // @ts-expect-error 'l' is duplicated
    slash('ll', 'path', 'to', 'file');
    // @ts-expect-error 'c' is not allowed to be negated
    slash('c!c', 'path', 'to', 'file');
  });
});
