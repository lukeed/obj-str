module.exports = function (babel) {
	const { types: t } = babel;
	const { ast } = babel.template.expression;

	/**
	 * Fails on strict mode when encountering an unoptimizable case.
	 */
	function throwUnoptimizable(path, state, message) {
		if (state.opts.strict) {
			throw path.buildCodeFrameError(message);
		}
	}

	/**
	 * Decontextualizes a node for comparison with a different node, irrespective
	 * of its location in source or surrounding comments.
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
	 */
	function propKey(prop) {
		return t.isIdentifier(prop.key) && !prop.computed
			? t.stringLiteral(prop.key.name)
			: prop.key;
	}

	/**
	 * Removes properties with duplicate keys, honoring the lastly defined value.
	 */
	function dedupe(path, state, properties) {
		const deduped = Object.create(null);
		for (const prop of properties) {
			if (!prop.key) {
				const { name } = path.node.callee;
				const { type, argument } = prop;
				throwUnoptimizable(
					path,
					state,
					`${name}() must only contain keyed props, found [${type}] ${
						(argument && argument.name) || '(unknown)'
					}`
				);
				return;
			}
			const key = JSON.stringify(decontextualize(propKey(prop)));
			deduped[key] = prop;
		}
		return Object.values(deduped);
	}

	/**
	 * Replaces a path with a simpler constant value if possible.
	 */
	function maybeEvaluate(path) {
		const { confident, value } = path.evaluate();
		if (confident) {
			path.replaceWith(ast(JSON.stringify(value)));
		}
	}

	/**
	 * Generates expression to concatenate strings.
	 */
	function concatExpr(properties) {
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
			CallExpression(path, state) {
				const callee = path.get('callee');
				if (!callee.referencesImport('obj-str', 'default')) {
					return;
				}

				const objectExpression = path.node.arguments[0];
				if (
					path.node.arguments.length !== 1 ||
					!t.isObjectExpression(objectExpression)
				) {
					throwUnoptimizable(
						path,
						state,
						`${path.node.callee.name}() argument should be a single Object Expression initializer.`
					);
					return;
				}

				const { properties } = objectExpression;
				const usableProperties = dedupe(path, state, properties);
				if (!usableProperties) {
					return;
				}

				const expression = concatExpr(usableProperties);
				path.replaceWith(expression);

				path.traverse({
					BinaryExpression: maybeEvaluate,
					ConditionalExpression: maybeEvaluate,
					LogicalExpression: maybeEvaluate,
				});

				maybeEvaluate(path);
			},
		},
	};
};
