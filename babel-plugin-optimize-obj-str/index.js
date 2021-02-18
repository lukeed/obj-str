// @ts-check

/**
 * @typedef {import('@babel/core').Node} Node
 * @typedef {import('@babel/core').NodePath<*>} NodePath
 * @typedef {import('@babel/core').PluginItem} PluginItem
 * @typedef {import('@babel/core').types.ObjectExpression['properties']} ObjectProperties
 */

/**
 * @param {import('@babel/core')} babel
 * @param {object} [options]
 * @param {boolean} [options.strict]
 * @returns {PluginItem}
 */
module.exports = function (babel, options={}) {
	const { types: t } = babel;
	const { ast } = babel.template.expression;

	/**
	 * Fails on strict mode when encountering an unoptimizable case.
	 * @param {NodePath} path
	 * @param {string} message
	 */
	function unoptimizable(path, message) {
		if (options.strict) throw path.buildCodeFrameError(`${path.node.callee.name}() ` + message);
	}

	/**
	 * Decontextualizes a node for comparison with a different node, irrespective
	 * of its location in source or surrounding comments.
	 * @param {Node} node
	 */
	function decontextualize(node) {
		const clean = { ...node };
		delete clean.extra;
		delete clean.loc;
		delete clean.start;
		delete clean.end;
		delete clean.range;
		delete clean.innerComments;
		delete clean.trailingComments;
		delete clean.leadingComments;
		for (const k in clean) {
			if (clean[k] && clean[k].type) {
				clean[k] = decontextualize(clean[k]);
			}
		}
		return clean;
	}

	/**
	 * Converts identifier property keys into string literals as mapped by spec,
	 * as how {a: x} is the same as {'a': x}.
	 * @NOTE Ignores `SpreadElement` intentionally; see `dedupe`
	 * @param {ObjectProperties[number]} prop
	 */
	function propKey(prop) {
		return t.isSpreadElement(prop) ? void 0 :
			t.isIdentifier(prop.key) && !prop.computed
				? t.stringLiteral(prop.key.name)
				: prop.key;
	}

	/**
	 * Removes properties with duplicate keys, honoring the lastly defined value.
	 * @param {NodePath} path
	 * @param {ObjectProperties} properties
	 * @returns {ObjectProperties|void}
	 */
	function dedupe(path, properties) {
		const cache = Object.create(null);
		for (let prop of properties) {
			if ('key' in prop) {
				cache[JSON.stringify(decontextualize(propKey(prop)))] = prop;
			} else {
				let { type, argument } = prop;
				return unoptimizable(path, `must only contain keyed props, found [${type}] ${
					(argument && argument.name) || '(unknown)'
				}`);
			}
		}
		return Object.values(cache);
	}

	/**
	 * Replaces a path with a simpler constant value if possible.
	 * @param {NodePath} path
	 */
	function tryEval(path) {
		const { confident, value } = path.evaluate();
		if (confident) path.replaceWith(ast(JSON.stringify(value)));
	}

	/**
	 * Generates expression to concatenate strings.
	 * @param {ObjectProperties} properties
	 */
	function expr(properties) {
		return properties.reduce((previous, prop) => {
			const condition = prop.value;
			const part = propKey(prop);
			return previous
				? ast`${previous} + (${condition} ? ' ' + ${part} : '')`
				: ast`'' + (${condition} ? ${part} : '')`;
		}, null);
	}

	return {
		name: 'optimize-obj-str',
		visitor: {
			CallExpression(path) {
				const callee = path.get('callee');
				if (!callee.referencesImport('obj-str', 'default')) return;

				const argument = path.node.arguments[0];
				if (path.node.arguments.length !== 1 || !t.isObjectExpression(argument)) {
					return unoptimizable(path, 'argument should be a single Object Expression initializer.');
				}

				const properties = dedupe(path, argument.properties);

				if (properties) {
					path.replaceWith(
						expr(properties)
					);

					path.traverse({
						BinaryExpression: tryEval,
						ConditionalExpression: tryEval,
						LogicalExpression: tryEval,
					});

					tryEval(path);
				}
			}
		}
	};
};
