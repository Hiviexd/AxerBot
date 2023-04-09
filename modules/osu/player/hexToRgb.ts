// ? https://stackoverflow.com/a/30971075

export default (c: string) => {
	if (/^#([a-f0-9]{3}){1,2}$/.test(c)) {
		if (c.length == 4) {
			c = "#" + [c[1], c[1], c[2], c[2], c[3], c[3]].join("");
		}
		c = "0x" + c.substring(1);
		let c_number = Number(c);
		return (
			"rgb(" +
			[
				(c_number >> 16) & 255,
				(c_number >> 8) & 255,
				c_number & 255,
			].join(",") +
			")"
		);
	}

	return "";
};
