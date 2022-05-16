// https://stackoverflow.com/a/57102605

export default (a: string, b: string) => {
	var i = 0;
	var j = 0;
	var result = "";

	if (b.length < a.length) {
		a = a.concat("™".repeat(a.length - b.length));
	}

	while (j < b.length) {
		if (a[i] != b[j] || i == a.length) result += b[j];
		else i++;
		j++;
	}

	return result.trim().length;
};
