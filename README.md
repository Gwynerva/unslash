# `/` unslash

Stop wasting your life on slash normalization.<br />
Zero dependencies because why would I need any?

## Install

```bash
npm install unslash
```

## Usage

```ts
import { slash } from 'unslash';

// Need a trailing slash? Done.
slash('t', 'path', 'to', 'file');
// → 'path/to/file/'

// Don’t want it? Gone.
slash('!t', 'path/to/file/');
// → 'path/to/file'

// Want a leading slash? Here you go.
slash('l', 'path', 'to', 'file');
// → '/path/to/file'

// Need to collapse that mess? Fixed.
slash('c', 'path///to', 'this//file');
// → 'path/to/this/file'

// Want to force forward slashes? Me too.
slash('f', 'path\\to', 'this/file');
// → 'path/to/this/file'

// Need Windows paths? What is wrong with you?!
slash('!f', 'path', 'to', 'file');
// → 'path\to\file'

// Combine them. Because you can.
slash('tlfc', 'path\\\\to\\file');
// → '/path/to/file/'
slash('!t!l!fc', '/path///to/file/');
// → 'path\to\file'

// Your precious protocols are safe — don’t worry.
slash('tlfc', 'http://example.com', 'path', 'to', 'file');
// → 'http://example.com/path/to/file/'
```

## Pattern Flags

- `t` / `!t` — Add/remove **T**railing slash
- `l` / `!l` — Add/remove **L**eading slash
- `f` / `!f` — Force **F**orward slashes / backward slashes
- `c` — **C**ollapse multiple slashes (yes, you’re right — `!c` doesn’t do shit)

## But Gwynerva, there are libraries for this

Yeah, I know.<br/>
I don’t give a shit.<br />
I was too lazy to look for them and made my own.<br />
Made with GPT help. Cry about it.

_It’d be cool if this package got popular and made me rich._
