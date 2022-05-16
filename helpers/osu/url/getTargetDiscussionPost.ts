import {
	Beatmapset,
	BeatmapsetCompact,
	BeatmapsetDiscussionCompact,
	BeatmapsetDiscussionPostCompact,
	BeatmapsetDiscussionPostResponse,
	BeatmapsetDiscussionVoteResponse,
} from "../../../types/beatmap";

export interface DiscussionAttributtes {
	beatmapsets: BeatmapsetCompact[];
	discussions: BeatmapsetDiscussionCompact[];
	posts: BeatmapsetDiscussionPostCompact[];
}

export default (post_info: any, post: BeatmapsetDiscussionPostResponse) => {
	let d: DiscussionAttributtes = {
		beatmapsets: [],
		discussions: [],
		posts: [],
	};

	d["beatmapsets"] = post.data.beatmapsets;
	d["discussions"] = post.data.discussions;
	d["posts"] =
		post.data.posts.filter((p) => p.id == Number(post_info.target)).length <
		1
			? post.data.posts
			: post.data.posts.filter((p) => p.id == Number(post_info.target));

	return d;
};
