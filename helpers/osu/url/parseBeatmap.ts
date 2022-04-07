import { Message } from "discord.js";
import BeatmapsetEmbed from "../../../responses/osu/BeatmapsetEmbed";
import { beatmapset } from "../fetcher/beatmap";
import getTargetBeatmap from "./getTargetBeatmap";

export default async (url: string, message: Message) => {
	const clear_url = url.split("/").filter((p) => p.trim() != "");
	if (clear_url.length < 4) return;

	const data: {
		beatmapset_id: string;
		beatmap_id: string | "";
		mode: "osu" | "taiko" | "mania" | "fruits" | "";
	} = {
		beatmapset_id: "",
		beatmap_id: "",
		mode: "",
	};

	if (clear_url.length == 5) {
		data.beatmapset_id = clear_url[3].split("#")[0];
		data.beatmap_id = clear_url[4];
		data.mode = getParamMode(clear_url[3]);
	} else {
		data.beatmapset_id = clear_url[3].split("#")[0];
		data.mode = "osu";
	}

	function getParamMode(
		id_param: string
	): "osu" | "taiko" | "mania" | "fruits" | "" {
		const mode: any = id_param.split("#")[1];

		if (mode.trim() == "") return "";

		return mode;
	}

	const chart = await getTargetBeatmap(data);

	if (chart?.beatmapset) {
		BeatmapsetEmbed.send(
			chart.beatmapset.data,
			data.beatmap_id,
			data.mode,
			message
		);
	}
};
