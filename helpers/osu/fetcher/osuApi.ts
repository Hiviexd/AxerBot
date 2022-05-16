import {
	beatmap,
	beatmapset,
	beatmapsetDiscussionPost,
	beatmapsetDiscussionVotes,
	download,
	featuredBeatmapsets,
	userBeatmaps,
} from "./beatmap";
import { user, userRecent } from "./user";
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
		userRecent: userRecent,
		comment: comment,
	},
	download: {
		beatmapset: download,
	},
};
