[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]
[![Dependency Status][daviddm-image]][daviddm-url] [![devDependency Status][daviddm-dev-image]][daviddm-dev-url]

# chalker

Enable XML like markers in strings to colorize text with [chalk].

# Usage

```js
const chalker = require("chalker");

console.log(chalker("<red.bgGreen>Red on Green Text</>"));
```

# Install

```
npm i --save chalker
```

- [chalk] is a `peerDependencies` so you need to add chalk also:

```
npm i --save chalk
```

# Demo

![demo][demo]

# Marker Details

- Color markers has the `<red>red text</red>` format. You can use any valid methods [chalk] supports.

  - For example, `<blue.bold>blue bold text</blue.bold>` will colorize `blue bold text` with `chalk.blue.bold`.
  - Closing marker can be simply `</>`

- The following HTML entities escapes are supported:

  | Entity   | Character | Entity   | Character          |
  | -------- | --------- | -------- | ------------------ |
  | `&lt;`   | <         | `&gt;`   | >                  |
  | `&amp;`  | &         | `&nbsp;` | non-breaking space |
  | `&apos;` | '         | `&copy;` | &copy;             |
  | `&quot;` | "         | `&reg;`  | &reg;              |

#### Advanced Chalk Colors

[Chalk advanced colors] can be applied with:

- `chalk.rgb` - `<(255, 10, 20)>`, `<rgb(255,10,20)>`
- `chalk.bgRgb` - `<bg(255, 10, 20)>`, `<bgRgb(255,10,20)>`
- `chalk.hex`, `chalk.bgHex` - `<#FF0000>`, `<bg#0000FF>`, `<hex(#FF0000)>`, `<bgHex(#0000FF)>`
- `chalk.keyword` - `<orange>`, `<(orange)>`, `<keyword(orange)>`
- `chalk.bgKeyword` - `bg-orange`, `<bg(orange)>`, `<bgKeyword(orange)>`
- `hsl`, `hsv`, `hwb` - `<hsl(32,100,50)>`, `<hsv(32,100,100)>`, `<hwb(32,0,50)>`

##### More details

- any thing not detected as hex or having `()` params and not found as a basic color is tried using `chalk.keyword`

    - ie: `<orange>`

  - If it's prefixed with `"bg-"` or `"bg "` then it's tried using `chalk.bgKeyword`

    - ie: `<bg-orange>`, `<bg orange>`

- All markers can be comined with `.` in any order as long as they work with [chalk]

    - ie: `<#FF0000.bg#0000FF.bg orange.keyword(red)>`

- Quotes can be used for keywords but **not necessary** and not recommended.

    - `<'orange'>`, `<"orange">`, `<``orange``>`, `<'bg orange'>`
    - `<keyword('orange')>`, `<keyword("orange")>`, `<keyword(``orange``)>`
    - `<bgKeyword('orange')>`, `<bgKeyword("orange")>`, `<bgKeyword(``orange``)>`

# APIs

### `chalker`

```js
chalker(str, [chalkInstance]);
```

- `str` - String with chalker color markers
- `chalkInstance` - Optional custom instance of [chalk].
  - ie: created from `new chalk.constructor({level: 2})`

**Returns:** A string with terminal color codes

### `chalker.remove`

```js
chalker.remove(str);
```

- `str` - String with chalker color markers

Simply remove all chalker markers and return the plain text string.

Note: This doesn't decode HTML entity escapes.  Use [decodeHtml](#chalkerdecodehtml) to decode them.

**Returns**: A plain text string without chalker color markers


### `chalker.decodeHtml`

```js
chalker.decodeHtml(str)
```

- `str` - String to decode HTML entities

**Returns**: String with HTML entities escapes decoded

# License

Copyright (c) 2019-present, Joel Chen

Licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).

---

[demo]: ./images/demo.png
[chalk]: https://www.npmjs.com/package/chalk
[chalk advanced colors]: https://github.com/chalk/chalk#256-and-truecolor-color-support
[travis-image]: https://travis-ci.org/jchip/chalker.svg?branch=master
[travis-url]: https://travis-ci.org/jchip/chalker
[npm-image]: https://badge.fury.io/js/chalker.svg
[npm-url]: https://npmjs.org/package/chalker
[daviddm-image]: https://david-dm.org/jchip/chalker/status.svg
[daviddm-url]: https://david-dm.org/jchip/chalker
[daviddm-dev-image]: https://david-dm.org/jchip/chalker/dev-status.svg
[daviddm-dev-url]: https://david-dm.org/jchip/chalker?type=dev