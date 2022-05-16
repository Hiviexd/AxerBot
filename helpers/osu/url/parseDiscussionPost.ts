import { Message } from "discord.js";
import BeatmapsetDiscussionEmbed from "../../../responses/osu/BeatmapsetDiscussionEmbed";
import osuApi from "../fetcher/osuApi";
import getDiscussionURLParams from "./getDiscussionURLParams";
import getTargetDiscussionPost from "./getTargetDiscussionPost";

export default async (url: string, message: Message) => {
	const postInfo = getDiscussionURLParams(url);

	if (postInfo.post == "") return;

	const post = await osuApi.fetch.beatmapsetDiscussionPost(
		postInfo.post,
		postInfo.type
	);

	if (post.status != 200) return;

	const targetPost = getTargetDiscussionPost(postInfo, post);

	if (!targetPost) return;

	BeatmapsetDiscussionEmbed.send(
		targetPost,
		post.data,
		postInfo.type,
		message
	);
};
