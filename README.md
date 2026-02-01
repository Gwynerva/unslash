# `/` unslash

Stop wasting your life on slash normalization.<br />
Works everywhere ("everywhere" means in browsers too).<br />
Zero dependencies because why would I need any?

## Install

```bash
npm install unslash
```

## Usage

```ts
import { s, slash } from 'unslash';

// Just join some paths. No magic.
s('path', 'to', 'file');
// → 'path/to/file'

// Need a trailing slash? Done.
s(/t/, 'path', 'to', 'file');
// → 'path/to/file/'

// Don’t want it? Gone.
s(/!t/, 'path/to/file/');
// → 'path/to/file'

// Want a leading slash? Here you go.
s(/l/, 'path', 'to', 'file');
// → '/path/to/file'

// Need to collapse that mess? Fixed.
s(/c/, 'path///to', 'this//file');
// → 'path/to/this/file'

// Want to force forward slashes? Me too.
s(/f/, 'path\\to', 'this/file');
// → 'path/to/this/file'

// Need Windows paths? What is wrong with you?!
s(/!f/, 'path', 'to', 'file');
// → 'path\to\file'

// Combine them. Because you can.
s(/tlfc/, 'path\\\\to\\file');
// → '/path/to/file/'
s(/!t!l!fc/, '/path///to/file/');
// → 'path\to\file'

// Your precious protocols are safe — don’t worry.
s(/tlfc/, 'http://example.com', 'path', 'to', 'file');
// → 'http://example.com/path/to/file/'
```

There are three ways to use the library:

```ts
import unslash, { s, slash } from 'unslash';
```

For all DRY lovers like me, you can create reusable formatters:

```ts
// Create a formatter
const normalize = s(/fc/); // Force forward, collapse

// Use it
normalize('path\\to\\file');
// → 'path/to/file'

// Extend it on the fly if you're feeling spicy
normalize(/t/, 'path\\to\\file');
// → 'path/to/file/'
```

For the lazy ones, `snormalize` (or `sn`) is already pre-configured with `/fc/` (Force forward + Collapse):

```ts
import { sn } from 'unslash';

sn('path\\to//file');
// → 'path/to/file'

sn(/t/, 'path\\to//file');
// → 'path/to/file/'
```

## Pattern Flags

Use these in your regex literal (e.g., `/tfc/`):

- `t` / `!t` — Add/remove **T**railing slash
- `l` / `!l` — Add/remove **L**eading slash
- `f` / `!f` — Force **F**orward slashes / backward slashes
- `c` / `!c` — **C**ollapse multiple slashes / Don't collapse

## But Gwynerva, there are libraries for this

Yeah, I know.<br/>
I don’t give a shit.<br />
I was too lazy to look for them and made my own.<br />
Created with GPT help. Cry about it.

_It’d be cool if this package got popular and made me rich._
