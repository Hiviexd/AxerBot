import {
	beatmap,
	beatmapset,
	beatmapsetDiscussionPost,
	beatmapsetDiscussionVotes,
	download,
	featuredBeatmapsets,
	userBeatmaps,
} from "./beatmap";
import { user } from "./user";
import { comment } from "./comment";

export default {
	fetch: {
		beatmap: beatmap,
		beatmapset: beatmapset,
		featuredBeatmapsets: featuredBeatmapsets,
		beatmapsetDiscussionPost: beatmapsetDiscussionPost,
		beatmapsetDiscussionVotes: beatmapsetDiscussionVotes,
		user: user,
		userBeatmaps: userBeatmaps,
		comment: comment,
	},
	download: {
		beatmapset: download,
	},
};
