import osuApi from "../fetcher/osuApi";

export default async (data: {
	beatmapset_id: string;
	beatmap_id: string | "";
	mode: "osu" | "taiko" | "mania" | "fruits" | "";
}) => {
	let beatmapset = await osuApi.fetch.beatmapset(data.beatmapset_id);

	if (beatmapset.status != 200) return;

	// if (data.mode != "")
	// 	beatmapset = await osuApi.fetch.beatmapset(
	// 		data.beatmapset_id,
	// 		data.mode
	// 	);

	let beatmap;

	if (data.beatmap_id != "") {
		beatmap = beatmapset.data.beatmaps?.filter((b) => {
			b.id == Number(data.beatmap_id);
		});
	}

	return {
		beatmap,
		beatmapset,
	};
};
