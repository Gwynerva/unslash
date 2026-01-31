export type SlashFlag = 't' | 'l' | 'f' | 'c';

export declare const unslash: unique symbol;
type link = 'https://github.com/Gwynerva/unslash';

export type UnknownFlagError<C extends string> = {
  readonly [unslash]: link;
  SlashPatternError: `Character "${C}" is not a valid SlashFlag (allowed: t l f c, optionally prefixed with "!")`;
};

export type DuplicateFlagError<F extends string> = {
  readonly [unslash]: link;
  SlashPatternError: `Flag "${F}" is used more than once or both negated and non-negated`;
};

export type ValidateSlashPattern<
  S extends string,
  Pos extends string = never,
  Neg extends string = never,
> =
  // "!x..."
  S extends `!${infer L}${infer R}`
    ? L extends SlashFlag
      ? L extends Pos | Neg
        ? DuplicateFlagError<L>
        : ValidateSlashPattern<R, Pos, Neg | L>
      : UnknownFlagError<`!${L}`>
    : // "x..."
      S extends `${infer L}${infer R}`
      ? L extends SlashFlag
        ? L extends Pos | Neg
          ? DuplicateFlagError<L>
          : ValidateSlashPattern<R, Pos | L, Neg>
        : UnknownFlagError<L>
      : // end of string → valid
        S;

export type SlashPattern<S extends string> =
  ValidateSlashPattern<S> extends string ? S : ValidateSlashPattern<S>;
