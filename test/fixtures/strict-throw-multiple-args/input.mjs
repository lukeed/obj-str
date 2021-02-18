import objstr from 'obj-str';

objstr(
	{ thisObjectArgumentIsOkay: true },
	'but throws since there is more than one arg'
);
