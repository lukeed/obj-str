export default function (obj) {
	var k, cls=[];
	for (k in obj) {
		if (obj[k]) {
			cls.push(k);
		}
	}
	return cls.join(" ");
}
