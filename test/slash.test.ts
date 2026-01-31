import { describe, it, expect } from 'vitest';

import { slash } from '@src/slash.js';

describe('slash', () => {
  describe('trailing slash (t)', () => {
    it('should add trailing slash with "t"', () => {
      expect(slash('t', 'path', 'to', 'file')).toBe('path/to/file/');
      expect(slash('t', 'path/')).toBe('path/');
    });

    it('should remove trailing slash with "!t"', () => {
      expect(slash('!t', 'path/to/file/')).toBe('path/to/file');
      expect(slash('!t', 'path')).toBe('path');
    });
  });

  describe('leading slash (l)', () => {
    it('should add leading slash with "l"', () => {
      expect(slash('l', 'path', 'to', 'file')).toBe('/path/to/file');
      expect(slash('l', '/path')).toBe('/path');
    });

    it('should remove leading slash with "!l"', () => {
      expect(slash('!l', '/path/to/file')).toBe('path/to/file');
      expect(slash('!l', 'path')).toBe('path');
      expect(slash('!l', '///path')).toBe('path');
    });
  });

  describe('force slashes (f)', () => {
    it('should use forward slashes by default with "f"', () => {
      expect(slash('f', 'path', 'to', 'file')).toBe('path/to/file');
    });

    it('should force backward slashes with "!f"', () => {
      expect(slash('!f', 'path', 'to', 'file')).toBe('path\\to\\file');
    });
  });

  describe('collapse slashes (c)', () => {
    it('should collapse multiple forward slashes with "c"', () => {
      expect(slash('c', 'path///to//file')).toBe('path/to/file');
    });

    it('should collapse multiple backward slashes with "c!f"', () => {
      expect(slash('c!f', 'path\\\\\\to\\\\file')).toBe('path\\to\\file');
    });

    it('should not collapse without "c"', () => {
      expect(slash('', 'path///to//file')).toBe('path///to//file');
    });
  });

  describe('combined patterns', () => {
    it('should handle "tlfc" - all flags enabled', () => {
      expect(slash('tlfc', 'path', 'to', 'file')).toBe('/path/to/file/');
      expect(slash('tlfc', '//path///to//file//')).toBe('/path/to/file/');
    });

    it('should handle "tl!f" - trailing and leading with backslashes', () => {
      expect(slash('tl!f', 'path', 'to', 'file')).toBe('\\path\\to\\file\\');
    });

    it('should handle "lf" - leading with forward slashes', () => {
      expect(slash('lf', 'path', 'to', 'file')).toBe('/path/to/file');
    });

    it('should handle "!t!l" - no leading or trailing slashes', () => {
      expect(slash('!t!l', '/path/to/file/')).toBe('path/to/file');
    });

    it('should handle "tc" - trailing with collapse', () => {
      expect(slash('tc', 'path//to///file')).toBe('path/to/file/');
    });

    it('should handle "lc" - leading with collapse', () => {
      expect(slash('lc', 'path//to///file')).toBe('/path/to/file');
    });
  });

  describe('protocol handling', () => {
    it('should preserve http:// protocol', () => {
      expect(slash('', 'http://example.com', 'path')).toBe(
        'http://example.com/path',
      );
    });

    it('should preserve https:// protocol with collapse', () => {
      expect(slash('c', 'https://example.com//path///to//file')).toBe(
        'https://example.com/path/to/file',
      );
    });

    it('should preserve file:// protocol', () => {
      expect(slash('l', 'file://path/to/file')).toBe('file:///path/to/file');
    });

    it('should preserve mailto: protocol', () => {
      expect(slash('', 'mailto:user@example.com')).toBe(
        'mailto:user@example.com',
      );
    });

    it('should handle protocol with trailing/leading flags', () => {
      expect(slash('tl', 'https://example.com', 'api', 'v1')).toBe(
        'https:///example.com/api/v1/',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty string parts', () => {
      expect(slash('', '', 'path', '')).toBe('path');
      expect(slash('c', '', 'path', '')).toBe('path');
    });

    it('should handle single part', () => {
      expect(slash('tl', 'path')).toBe('/path/');
      expect(slash('', 'path')).toBe('path');
    });

    it('should handle no parts (empty result)', () => {
      expect(slash('!t!l')).toBe('');
      expect(slash('')).toBe('');
      expect(slash('l')).toBe('');
      expect(slash('tl')).toBe('/');
      expect(slash('t')).toBe('/');
    });

    it('should handle parts with mixed slashes', () => {
      expect(slash('c', 'path\\to', 'file/name')).toBe('path\\to/file/name');
      expect(slash('cf', 'path\\to', 'file/name')).toBe('path/to/file/name');
    });

    it('should handle already formatted paths', () => {
      expect(slash('tl', '/path/to/file/')).toBe('/path/to/file/');
      expect(slash('!t!l', 'path/to/file')).toBe('path/to/file');
    });
  });

  describe('pattern order independence', () => {
    it('should produce same result regardless of flag order', () => {
      expect(slash('tlc', 'path', 'to')).toBe(slash('ltc', 'path', 'to'));
      expect(slash('tlc', 'path', 'to')).toBe(slash('ctl', 'path', 'to'));
      expect(slash('fcl', 'path', 'to')).toBe(slash('lfc', 'path', 'to'));
    });
  });
});
