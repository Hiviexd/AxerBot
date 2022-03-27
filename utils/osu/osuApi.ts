import {
	beatmap,
	beatmapset,
	beatmapsetDiscussionPost,
	userBeatmaps,
} from "./fetcher/beatmap";
import { user } from "./fetcher/user";

export default {
	fetch: {
		beatmap: beatmap,
		beatmapset: beatmapset,
		beatmapsetDiscussionPost: beatmapsetDiscussionPost,
		user: user,
		userBeatmaps: userBeatmaps,
	},
};
