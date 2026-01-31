import { describe, expectTypeOf, it } from 'vitest';

import type {
  DuplicateFlagError,
  SlashPattern,
  UnknownFlagError,
} from '@src/pattern.js';

describe('SlashPattern', () => {
  it('should pass for valid patterns', () => {
    expectTypeOf<SlashPattern<'tlfc'>>().toEqualTypeOf<'tlfc'>();
    expectTypeOf<SlashPattern<'!tlfc'>>().toEqualTypeOf<'!tlfc'>();
    expectTypeOf<SlashPattern<'t!lfc'>>().toEqualTypeOf<'t!lfc'>();
    expectTypeOf<SlashPattern<''>>().toEqualTypeOf<''>();
  });

  it('should error for unknown flags', () => {
    expectTypeOf<SlashPattern<'x'>>().toEqualTypeOf<UnknownFlagError<'x'>>();
    expectTypeOf<SlashPattern<'!y'>>().toEqualTypeOf<UnknownFlagError<'!y'>>();
    expectTypeOf<SlashPattern<'ll'>>().toEqualTypeOf<DuplicateFlagError<'l'>>();
    expectTypeOf<SlashPattern<'c!c'>>().toEqualTypeOf<
      DuplicateFlagError<'c'>
    >();
  });
});
