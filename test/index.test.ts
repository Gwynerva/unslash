import { describe, it, expect } from 'vitest';

import slash, { s, sn, snormalize } from '@src/index.js';

describe('unslash', () => {
  describe('basic usage (string args)', () => {
    it('joins arguments with forward slash', () => {
      expect(slash('a', 'b', 'c')).toBe('a/b/c');
    });

    it('does not modify slashes in arguments', () => {
      // Basic usage acts as a simple joiner
      expect(slash('a\\b', 'c//d')).toBe('a\\b/c//d');
    });

    it('returns empty string for no args', () => {
      expect(slash()).toBe('');
    });
  });

  describe('trailing slash (t)', () => {
    it('omitted: preserves trailing slash by default', () => {
      // If regex is provided, default behavior for unspecified l/t is to preserve
      expect(slash(/f/, 'a/')).toBe('a/');
      expect(slash(/f/, 'a\\')).toBe('a/'); // f forces forward, preserves presence
    });

    it('t: adds trailing slash', () => {
      expect(slash(/t/, 'a')).toBe('a/');
      expect(slash(/t/, 'a/')).toBe('a/');
      expect(slash(/t/, 'a////')).toBe('a////');
    });

    it('!t: removes trailing slash', () => {
      expect(slash(/!t/, 'a////')).toBe('a');
      expect(slash(/!t/, 'a/')).toBe('a');
      expect(slash(/!t/, 'a')).toBe('a');
    });

    it('uses correct slash char based on f', () => {
      expect(slash(/!ft/, 'a')).toBe('a\\');
    });
  });

  describe('leading slash (l)', () => {
    it('omitted: preserves leading slash by default', () => {
      expect(slash(/f/, '/a')).toBe('/a');
      expect(slash(/f/, '\\a')).toBe('/a');
    });

    it('l: adds leading slash', () => {
      expect(slash(/l/, 'a')).toBe('/a');
      expect(slash(/l/, '/a')).toBe('/a');
      expect(slash(/l/, '////a')).toBe('////a');
    });

    it('!l: removes leading slash', () => {
      expect(slash(/!l/, '/a')).toBe('a');
      expect(slash(/!l/, 'a')).toBe('a');
      expect(slash(/!l/, '////a')).toBe('a');
    });

    it('uses correct slash char based on f', () => {
      expect(slash(/!fl/, 'a')).toBe('\\a');
    });
  });

  describe('force slashes (f)', () => {
    it('f: forces forward slashes', () => {
      expect(slash(/f/, 'a\\b')).toBe('a/b');
      expect(slash(/f/, 'a/b')).toBe('a/b');
    });

    it('!f: forces backslashes', () => {
      expect(slash(/!f/, 'a/b')).toBe('a\\b');
      expect(slash(/!f/, 'a\\b')).toBe('a\\b');
    });

    it('omitted: no forced replacement of inner slashes', () => {
      // Only joins with / (default slashChar), and preserves leading/trailing
      const res = slash(/t/, 'a\\b');
      // 1. joins -> a\b
      // 2. preserves lead -> a\b
      // 3. adds trailing (t) -> a\b/
      expect(res).toBe('a\\b/');
    });
  });

  describe('collapse (c)', () => {
    it('c: collapses repeated slashes', () => {
      expect(slash(/fc/, 'a//b///c')).toBe('a/b/c');
      // Collapse respecting !f
      expect(slash(/!fc/, 'a\\\\b')).toBe('a\\b');
    });

    it('omitted: does not collapse', () => {
      expect(slash(/f/, 'a//b')).toBe('a//b');
    });

    it('collapses mixed slashes if forced', () => {
      // if force forward, replaces \ with /, then collapses //
      expect(slash(/fc/, 'a/\\b')).toBe('a/b');
    });

    it('collapses empty strings', () => {
      expect(slash(/c/, 'a//////b', '', 'c')).toBe('a/b/c');
    });
  });

  describe('flag overrides (left-to-right)', () => {
    it('later flags override earlier ones', () => {
      expect(slash(/t!t/, 'a')).toBe('a');
      expect(slash(/!tt/, 'a')).toBe('a/');

      expect(slash(/l!l/, 'a')).toBe('a');
      expect(slash(/!ll/, 'a')).toBe('/a');

      expect(slash(/f!f/, 'a/b')).toBe('a\\b');
      expect(slash(/!ff/, 'a\\b')).toBe('a/b');

      expect(slash(/c!c/, 'a//b')).toBe('a//b');
    });
  });

  describe('protocols', () => {
    it('preserves http://', () => {
      expect(slash(/fc/, 'http://example.com/foo//bar')).toBe(
        'http://example.com/foo/bar',
      );
    });

    it('preserves file://', () => {
      expect(slash(/fc/, 'file://C:/foo/bar')).toBe('file://C:/foo/bar');
    });

    it('handles protocol with !f', () => {
      // Protocols are preserved, but the rest is processed
      // Using !f means backslashes for the rest
      const res = slash(/!f/, 'http://example.com/foo');
      expect(res).toBe('http://example.com\\foo');
    });
  });

  describe('currying and chaining', () => {
    it('creates reusable formatter', () => {
      const mySlash = slash(/f/);
      expect(mySlash('a\\b')).toBe('a/b');
    });

    it('chains formatters (merges flags)', () => {
      const base = slash(/f/); // force forward
      const addT = base(/t/); // extends base with t
      expect(addT('a')).toBe('a/');

      // Base formatter is immutable
      expect(base('a')).toBe('a');
    });

    it('allows pattern override in chain', () => {
      const forceBack = slash(/!f/);
      const forceForward = forceBack(/f/);
      expect(forceForward('a\\b')).toBe('a/b');
    });

    it('supports calling formatter with pattern and parts', () => {
      const base = slash(/f/);
      expect(base(/t/, 'a\\b')).toBe('a/b/');
    });
  });

  describe('aliases', () => {
    it('s is alias for slash', () => {
      expect(s).toBe(slash);
      expect(s('a', 'b')).toBe('a/b');
    });

    it('snormalize (sn) forces forward, collapses', () => {
      // slash(/fc/)
      expect(sn('//a\\b//')).toBe('/a/b/');
      expect(snormalize).toBe(sn);
    });
  });

  describe('edge cases', () => {
    it('empty strings', () => {
      expect(slash(/f/, '')).toBe('');
      // default preserves, so empty stays empty

      expect(slash(/l/, '')).toBe('/');
      expect(slash(/t/, '')).toBe('/');
    });

    it('preserves trailing/leading whitespace', () => {
      expect(slash(/f/, ' a ')).toBe(' a ');
    });

    it('root paths with flags', () => {
      expect(slash(/l/, '/')).toBe('/');
      expect(slash(/t/, '/')).toBe('/');
      expect(slash(/lt/, '/')).toBe('/');
      expect(slash(/!l!t/, '/')).toBe('');
      expect(slash(/f/, '/')).toBe('/');
    });
  });
});
