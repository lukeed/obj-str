export default function (obj) {
	var cls, k
	for (k in obj) {
		if (obj[k]) {
			cls = cls == null ? cls : cls + ' ' + k;
		}
	}
	return cls || '';
}
