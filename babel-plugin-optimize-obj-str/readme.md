# babel-plugin-optimize-obj-str

> [Babel](https://babeljs.io/) plugin to optimize [`obj-str`](../) calls by replacing them with an equivalent unrolled expression.

Even though the `obj-str` function is negligible in size over-the-wire, the motivation for this plugin is that transformed expressions [execute almost twice as fast as equivalent calls.](#output-code-performance)

```js
import objstr from 'obj-str';
objstr({
  'my-classname': true,
  'another-one': maybe,
});

// Transformed:
'' + (true ? 'my-classname' : '') + (maybe ? ' another-one' : '');
```

> **Note**: This plugin does not attempt to minimize output, so it may be wordy. You should additionally use a minifier like [`terser`](https://terser.org/) for best results.

## Install

```
npm install --save-dev babel-plugin-optimize-obj-str
```

## Usage

**Via babel.config.js** ([recommended](https://babeljs.io/docs/en/configuration)):

```js
module.exports = {
  plugins: ['optimize-obj-str'],
};
```

**Via CLI**:

```
babel --plugins optimize-obj-str script.js
```

## Options

```js
module.exports = {
  plugins: [
    [
      'optimize-obj-str',
      {
        strict: false,
        leadingSpace: false,
        referencesImport: ['obj-str', 'default'],
      },
    ],
  ],
};
```

### `strict`

| type          | default |
| ------------- | ------- |
| **`boolean`** | `false` |

**Enable to fail when encountering calls that cannot be optimized.**

We can only optimize function calls whose single argument is an **object literal** containing only **keyed properties**.

```js
objstr({
  'optimizable': true,
  [classes.myClass]: maybe,
});

// Transformed:
('' +
  (true ? 'optimizable' : '');
  (maybe ? ' ' + classes.myClass : ''));
```

By default, calls that cannot be optimized are preserved.

```js
objstr({ optimizable: true });
objstr(cannotOptimizeIdentifierArg);
objstr({ ...cannotOptimizeSpread });

// Transformed:
('optimizable');
objstr(cannotOptimizeIdentifierArg);
objstr({ ...cannotOptimizeSpread });
```

Preserved calls force the resulting bundle to contain the `objstr()` function, which could otherwise be [dead-code-eliminated](https://en.wikipedia.org/wiki/Dead_code_elimination).

Instead, when setting the option **`{ strict: true }`** the plugin errors out to prevent this.

> <pre><code>file.js: objstr() argument should be a single Object Expression initializer.
>   1 | objstr({ 'optimizable': true });
> > 2 | objstr(cannotOptimizeIdentifierArg);
>     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^</code></pre>

### `leadingSpace`

| type          | default |
| ------------- | ------- |
| **`boolean`** | `false` |

**Enable to allow leading spaces in expression results.**

Transformed expressions may employ a helper variable, so that a space separator is only conditionally included. This keeps the expression consistent with its equivalent `objstr()` result.

```js
objstr({ a: false, foo: true, bar: true });

// Transformed and minified:
('foo bar');
```

This helper variable is omitted when setting the option **`{ leadingSpace: true }`**, so expression results may include a leading space.

```js
(' foo bar');
```

The benefit of allowing this leading space is to output smaller code:

```js
objstr({ x, y, z });

// { leadingSpace: false }
let _;
('' +
  (x ? (_ = true, '') + 'x' : '') +
  (y ? (_ ? ' ' : (_ = true, '')) + 'y' : '') +
  (z ? (_ ? ' ' : (_ = true, '')) + 'z' : ''));


// { leadingSpace: true }
'' +
  (x ? 'x' : '') +
  (y ? ' y' : '') +
  (z ? ' z' : ''));
```

> **Note**: This option is safe only when expression consumers ignore the leading space, like a classname on a DOM element would.

### `referencesImport`

| type                   | default                  |
| ---------------------- | ------------------------ |
| **`[string, string]`** | `['obj-str', 'default']` |

**Defines which imported function to transform.**

By default, calls to the unnamed export from the `obj-str` module are transformed.

```js
import whateverName from 'obj-str';
whateverName({ foo: true });
```

When using a module other than `obj-str`, you should specify an array with two items:  
**`{ referencesImport: [moduleSource, importName] }`**

```js
// { referencesImport: ['fun-module', 'coolFunction'] }

import { coolFunction } from 'fun-module';
coolFunction({ foo: true });
```

## Caveats

### Output Code Performance

The purpose of this transform is to improve execution performance. [You may run this benchmark](https://jsbench.me/nukl0mvqze/1) on any given environment, which should yield similar performance characteristics as this run on desktop Chrome (88):

| no transform                                  | `{ leadingSpace: false }`                       | `{ leadingSpace: true }`                   |
| --------------------------------------------- | ----------------------------------------------- | ------------------------------------------ |
| 7189456.12 ops/s ± 0.9%<br>**44.25 % slower** | 11159200.61 ops/s ± 0.74%<br>**13.46 % slower** | 12895408.64 ops/s ± 0.53%<br>**_Fastest_** |

This transform should not be expected to reduce bundle size. Depending on the amount of object properties and plugin configuration, it might actually output slightly _larger_ code.

For example, the following creates bundles nearly equally as large with `{ leadingSpace: false }`:

<!-- prettier-ignore -->
```js
import objstr from 'obj-str';
objstr({ a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z });
```

| no transform | `{ leadingSpace: false }` | `{ leadingSpace: true }` |
| ------------ | ------------------------- | ------------------------ |
| `139 B`\*    | `129 B`\*                 | `103 B`\*                |

_\* bundled, minified, brotli compressed_

Depending on your project's requirements, you might find the performance tradeoff beneficial or not. It's recommended to set `{ leadingSpace: true }` for the smallest bundle sizes, and to compare size deltas on your own bundles.

### Inconsistent Duplicates

Object literals may contain duplicate property names, in which case [the lastly defined value is preserved.](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#Duplicate_property_names)

```js
objstr({ dupe: 0, dupe: 1 });

// Transformed:
'' + (1 ? 'dupe' : '');
```

The example above is transformed properly since the duplicate property names are literal and constant. The plugin does its best to override duplicates by comparing property name expressions, but it's unable to compare equal computed results whose expressions vary.

<!-- prettier-ignore -->
```js
objstr({
  good: one,
  'good': two,
  ['good']: three,
});
objstr({
  bad: one,
  'bad': two,
  ['ba' + 'd']: three,
});

// Transformed:
'' + (three ? 'good' : '');
'' + (two ? 'bad' : '') + (three ? ' bad' : '');
```

It's therefore recommended to reserve the use of [computed property names](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#computed_property_names) for identifiers to unique values, and to avoid complex expressions. This reduces the likelihood of mismatched dupes.

```js
// These computed names are likely ok:
objstr({ [FOO]: true });
objstr({ [myConstants.BAR]: true });

// More complex computed names are at a higher risk of duping:
objstr({
  [FOO + 'bar']: true,
  [FOO + possiblyBar]: false,
});
```

## License

MIT
