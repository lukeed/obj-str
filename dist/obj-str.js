module.exports = function (obj) {
	var cls = '';
	for (var k in obj) {
		if (obj[k]) {
			cls && (cls += ' ');
			cls += k;
		}
	}
	return cls;
};
