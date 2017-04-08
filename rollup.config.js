const pkg = require('./package');

export default {
	useStrict: false,
	entry: 'src/index.js',
	targets: [
		{dest: pkg.main, format: 'cjs'},
		{dest: pkg.module, format: 'es'}
	]
};
