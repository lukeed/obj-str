import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import objstr from '../src';

function is(input, expect) {
	assert.is(objstr(input), expect);
}

const API = suite('exports');

API('should export a function', () => {
	assert.type(objstr, 'function');
});

API.run();

// ---

const usage = suite('usage');

usage('true -> ""', () => {
	is(true, '');
});

usage('false -> ""', () => {
	is(false, '');
});

usage('undefined -> ""', () => {
	is(undefined, '');
});

usage('null -> ""', () => {
	is(null, '');
});

usage('{} -> ""', () => {
	is({}, '');
});

usage('[] -> ""', () => {
	is([], '');
});

usage('{ foo } -> "foo"', () => {
	is({ foo: true }, 'foo');
	is({ foo: 1 }, 'foo');
});

usage('{ foo, bar } -> "foo"', () => {
	is({ foo: true, bar: false }, 'foo');
	is({ foo: 1, bar: 0 }, 'foo');
});

usage('{ foo, bar, baz } -> "foo baz"', () => {
	is({ foo: 1 === 1, bar: 1 !== 1, baz: 1 !== 2 }, 'foo baz');
	is({ foo: assert, bar: null, baz: Date }, 'foo baz');
});

usage('{ one, two, bad } -> "one two"', () => {
	let one=true, two=true, bad=false;
	is({ one, two, bad }, 'one two');
});

usage('{ "-foo": x } -> "-foo"', () => {
	is({ '-foo': true }, '-foo');
	is({ '-foo': 0, '-foo': 1 }, '-foo');
});

usage('{ [key]: x } -> key', () => {
	let key = 'abc';
	is({ [key]: true }, 'abc');
});

usage.run();
