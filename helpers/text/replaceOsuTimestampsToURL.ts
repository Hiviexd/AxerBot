export default (rawText: string) => {
	const TIMESTAMP = /(\d+):(\d{2}):(\d{3})\s*(\(((\d,?)+)\))?/gim;

	const timestamps = rawText.match(TIMESTAMP);

	if (!timestamps) return rawText;

	let parsed = rawText;
	for (const timestamp of timestamps) {
		const res = TIMESTAMP.exec(timestamp);
		TIMESTAMP.lastIndex = 0;
		if (!res) continue;

		let url = `[${timestamp}](https://axer-url.ppy.tn/edit/${res[1]}:${res[2]}:${res[3]}`;

		if (res[4]) url += `-${res[4]}`;
		url += ")";

		parsed = parsed.replace(timestamp, url);
	}

	return parsed;
};
