import { BeatmapsetDiscussionPostResponse } from "../../../types/beatmap";

export default (post_info: any, post: BeatmapsetDiscussionPostResponse) => {
	let d: any = {
		beatmapsets: [],
		discussions: [],
		posts: [],
	};

	if (post_info.target != "") {
		d["beatmapsets"] = post.data.beatmapsets;
		d["discussions"] = post.data.discussions;
		d["posts"] = post.data.posts.filter(
			(p) => p.id == Number(post_info.target)
		);

		return d;
	}

	return post.data;
};
