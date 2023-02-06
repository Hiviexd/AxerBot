export default (url: string) => {
	let url_object = url.split("/");
	url_object = url_object.filter((p) => p.trim() != "");

	let data = {
		post: "",
		target: "",
		type: "reply",
		beatmapset: "",
	};

	if (url_object.length == 8) {
		try {
			data.post = url_object[7];
			data.type = "first";

			data.beatmapset = url_object[3];
		} catch (e) {
			console.error(e);
		}
	} else if (url_object.length == 6) {
		data.post = url_object[5];
		data.type = "first";
		data.beatmapset = url_object[3];

		return data;
	} else {
		try {
			data.post = url_object[7];
			data.target = url_object[8];
			data.beatmapset = url_object[3];

			return data;
		} catch (e) {
			console.error(e);
		}
	}

	return data;
};
