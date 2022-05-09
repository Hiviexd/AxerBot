import { Message } from "discord.js";
import osuApi from "../fetcher/osuApi";
import CommentEmbed from "../../../responses/osu/CommentEmbed";
import { CommentUser, User } from "../../../types/user";

export interface ParsedComment {
	type: "Comment" | "Reply";
	title: string;
	url: string;
	user: CommentUser;
	repliedAuthor?: User;
	postType: "build" | "news_post" | "beatmapset";
	content: string;
	votes: number;
}

export default async (url: string, message: Message) => {
	const comment_id = url.split("/").pop();

	if (!comment_id || isNaN(Number(comment_id))) return;

	const comment_data: ParsedComment = {
		type: "Comment",
		title: "Anonymous",
		postType: "news_post",
		votes: 0,
		user: {
			avatar_url: "",
			country_code: "",
			default_group: "",
			id: 0,
			is_active: false,
			is_bot: false,
			is_deleted: false,
			is_online: false,
			is_supporter: false,
			last_visit: "",
			pm_friends_only: true,
			profile_colour: "",
			username: "",
		},
		url: "https://osu.ppy.sh/",
		content: "",
	};

	const targetComment = await osuApi.fetch.comment(comment_id);

	if (
		!targetComment.data ||
		targetComment.status != 200 ||
		!targetComment.data.comments[0] ||
		targetComment.data.comments[0].message == null
	)
		return;

	comment_data.type =
		targetComment.data.comments[0].parent_id == null ? "Comment" : "Reply";
	comment_data.votes = targetComment.data.comments[0].votes_count;
	comment_data.postType = targetComment.data.comments[0].commentable_type;
	comment_data.user =
		targetComment.data.users.find(
			(u) => u.id == targetComment.data.comments[0].user_id
		) || targetComment.data.users[0];
	comment_data.content = targetComment.data.comments[0].message;
	comment_data.title = targetComment.data.commentable_meta[0].title;
	comment_data.url = targetComment.data.commentable_meta[0].url;

	if (comment_data.type == "Reply") {
		const repliedCommentObject = targetComment.data.included_comments.find(
			(c) => c.id == targetComment.data.comments[0].parent_id
		);

		if (!repliedCommentObject)
			return CommentEmbed.send(comment_data, message);

		const repliedComment = await osuApi.fetch.comment(
			String(repliedCommentObject.id)
		);

		if (
			!repliedComment.data ||
			repliedComment.status != 200 ||
			!repliedComment.data.comments[0] ||
			repliedComment.data.comments[0].message == null
		)
			return CommentEmbed.send(comment_data, message);

		const repliedUser = await osuApi.fetch.user(
			repliedComment.data.comments[0].user_id.toString()
		);

		if (repliedUser.status != 200)
			return CommentEmbed.send(comment_data, message);

		comment_data.repliedAuthor = repliedUser.data;
	}

	CommentEmbed.send(comment_data, message);
};
