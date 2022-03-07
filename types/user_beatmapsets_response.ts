import { Beatmapset } from "./beatmap";

export interface UserBeatmapetsResponse {
	status: number;
	data: {
		sets: Beatmapset[];
		last: Beatmapset;
		first: Beatmapset;
		sets_playcount: number;
		sets_favourites: number;
	};
}
