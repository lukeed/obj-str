import objstr from 'obj-str';

objstr({
	'keyed-properties-are-okay': true,
	...butSpreadOperatorIsNotOkay,
});
