import {
	beatmap,
	beatmapset,
	beatmapsetDiscussionPost,
	userBeatmaps,
} from "./beatmap";
import { user } from "./user";

export default {
	fetch: {
		beatmap: beatmap,
		beatmapset: beatmapset,
		beatmapsetDiscussionPost: beatmapsetDiscussionPost,
		user: user,
		userBeatmaps: userBeatmaps,
	},
};
