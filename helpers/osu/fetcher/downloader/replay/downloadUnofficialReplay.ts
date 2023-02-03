const fetch = import("node-fetch");

export async function downloadUnofficialReplay(url: string) {
	const request = await (
		await fetch
	).default(url, {
		headers: {
			accept: "application/octet-stream",
		},
	});

	const data = await request.buffer();

	return data;
}
