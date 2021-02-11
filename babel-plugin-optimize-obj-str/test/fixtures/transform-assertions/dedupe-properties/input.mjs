import objstr from 'obj-str';

objstr({
	dupe: 0,
	a,
	dupe: 1,
	b,
	dupe: final,
	c,
});

objstr({
	dupe: 0,
	'dupe': 1,
	['dupe']: final,
});

objstr({
	[a + b]: 0,
	[a + b]: 1,
	[a + b]: final,
});
