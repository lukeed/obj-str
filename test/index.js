const test = require('tape');
const fn = require('../');

test('title', t => {
	t.is(fn('unicorns'), 'unicorns & rainbows');
});
