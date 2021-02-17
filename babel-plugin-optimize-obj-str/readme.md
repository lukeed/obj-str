# babel-plugin-optimize-obj-str

> [Babel](https://babeljs.io/) plugin to optimize [`obj-str`](../) calls by replacing them with an equivalent unrolled expression.

Even though the `obj-str` function is negligible in size over-the-wire, the motivation for this plugin is that transformed expressions [execute almost twice as fast as equivalent calls.](#performance)

```js
import objstr from 'obj-str';
objstr({
  'my-classname': true,
  'another-one': maybe,
  'third': a && b,
});

// Transformed:
'' +
  (true ? 'my-classname' : '') +
  (maybe ? ' ' + 'another-one' : '') +
  (a && b ? ' ' + 'third' : '');
```

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

<blockquote><pre><code>file.js: objstr() argument should be a single Object Expression initializer.
  1 | objstr({ 'optimizable': true });
> 2 | objstr(cannotOptimizeIdentifierArg);
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^</code></pre></blockquote>

## Caveats

### Requires Minification

This plugin does not attempt to minimize output, so it may be wordy. You should additionally use a minifier like [`terser`](https://terser.org/) for best results.

```js
// transformed:
'' + (true ? 'foo' : '');

// transformed and minified:
('foo');
```

### Performance

The purpose of this transform is to improve execution performance. [This benchmark results in a ~1.8x speedup](https://jsbench.me/nukl0mvqze/1) on desktop Chrome (88) (`obj-str` calls are about 45% slower).

You should not expect this transform should to reduce bundle size. Depending on the amount of object properties and plugin configuration, it might actually output slightly _larger_ code. A rough estimate is that [using less than ~100 different conditional properties](https://gist.github.com/alanorozco/6d83ae5af1ab121757fc29cdb5d77f22) should not increase the size of a bundle.

### Leading Space

Direct results from `objstr()` always omit a leading space:

```js
objstr({ a: false, foo: true });
/* outputs: */ ('foo');
```

When using this transform, a leading space may be included:

```js
'' + (false ? 'a' : '') + (true ? ' ' + 'foo' : '');
/* outputs: */ (' foo');
```

You must ensure that your expression consumers ignore this leading space. A [classname](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) should work just fine.

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
