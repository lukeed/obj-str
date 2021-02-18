import { join } from 'path';
import { promisify } from 'util';
import { readFile, readdirSync } from 'fs';
import * as assert from 'uvu/assert';
import { test } from 'uvu';

// Babel Setup
import * as BABEL from '@babel/core';
import PLUGIN from '../babel-plugin-optimize-obj-str';

function transform(str, options={}) {
	const plugins = [PLUGIN(BABEL, options)];
	return BABEL.transformAsync(str, { plugins }).then(r => r.code + '\n');
}

const read = promisify(readFile);
const fixtures = join(__dirname, 'fixtures');

readdirSync(fixtures).forEach(dir => {
	let input = join(fixtures, dir, 'input.mjs');
	let output = join(fixtures, dir, 'output.mjs');
	let options = join(fixtures, dir, 'options.json');
	let { throws, strict=false } = require(options);

	test(dir, async () => {
		let before = await read(input, 'utf8');

		try {
			let result = await transform(before, { strict });
			if (throws) assert.unreachable('should have thrown');
			assert.fixture(result, await read(output, 'utf8'));
		} catch (err) {
			if (throws) assert.match(err.message, throws);
			else assert.unreachable('should not have thrown!');
		}
	});
});

test.run();
