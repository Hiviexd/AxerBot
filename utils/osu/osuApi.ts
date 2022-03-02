import { beatmap, beatmapset, userBeatmaps } from "./fetcher/beatmap";
import { user } from "./fetcher/user";

export default {
	fetch: {
		beatmap: beatmap,
		beatmapset: beatmapset,
		user: user,
		userBeatmaps: userBeatmaps,
	},
};
