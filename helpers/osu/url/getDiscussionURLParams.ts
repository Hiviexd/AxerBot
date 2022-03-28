export default (url: string) => {
	let url_object = url.split("/");
	url_object = url_object.filter((p) => p.trim() != "");

	let data = {
		post: "",
		target: "",
		type: "reply",
	};

	if (url_object.length == 8) {
		try {
			data.post = url_object[7];
			data.type = "first";
		} catch (e) {
			console.error(e);
		}
	} else {
		try {
			data.post = url_object[7];
			data.target = url_object[8];
		} catch (e) {
			console.error(e);
		}
	}

	return data;
};
