import {
	beatmap,
	beatmapset,
	beatmapsetDiscussionPost,
	download,
	userBeatmaps,
} from "./beatmap";
import { user } from "./user";
import { comment } from "./comment";

export default {
	fetch: {
		beatmap: beatmap,
		beatmapset: beatmapset,
		beatmapsetDiscussionPost: beatmapsetDiscussionPost,
		user: user,
		userBeatmaps: userBeatmaps,
		comment: comment,
	},
	download: {
		beatmapset: download,
	},
};
