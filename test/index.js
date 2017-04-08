const test = require('tape');
const fn = require('../dist/obj-str');

const one = true;
const two = true;
const bad = false;

test('obj-str', t => {
	t.equal(typeof fn, 'function', 'exports a function');

	t.equal(fn(), '', 'returns empty string by default');
	t.equal(fn({}), '', `{} --> ''`);
	t.equal(fn({foo: true}), 'foo', `{ foo:true } --> foo`);
	t.equal(fn({foo: true, bar: false}), 'foo', `{ foo:true, bar:false } --> foo`);
	t.equal(fn({foo: 1 === 1, bar: 1 !== 1, baz: 1 !== 2}), 'foo baz', `{ foo:1===1, bar:1!==1, baz:1!==2 } --> foo baz`);
	t.equal(fn({one, two, bad}), 'one two', `{ one, two, bad } --> one two`);

	t.end();
});
