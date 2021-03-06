import objstr from 'obj-str';

objstr({ keyIsValueId });
objstr({ 'quoted': x && y });
objstr({ unquoted: true });
objstr({ [identifierExpression]: probably });
objstr({ [compound + expression]: maybe });
objstr({ [member.expression]: maybeMemberExpression });
objstr({
	'constant-true-first': true,
	'anything else': foo,
});
objstr({
	keyIsValueId,
	'quoted': x && y,
	unquoted: true,
	[identifierExpression]: probably,
	[compound + expression]: maybe,
	[member.expression]: maybeMemberExpression,
});
objstr({
	'not-nested': a,
	[objstr({ nested: b })]: c,
});
