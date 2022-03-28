import { BeatmapsetDiscussionPost } from "../../types/beatmap";
import { Message, MessageEmbed } from "discord.js";
import getHighestUsergroup from "../../helpers/osu/player/getHighestUsergroup";
import osuApi from "../../helpers/osu/fetcher/osuApi";
import generatePostEmbedDecoration from "../../helpers/text/embeds/generatePostEmbedDecoration";

export default {
	send: async (
		post: BeatmapsetDiscussionPost,
		raw_posts: BeatmapsetDiscussionPost,
		type: string,
		message: Message
	) => {
		if (post.posts.length < 1) return;
		const author = await osuApi.fetch.user(String(post.posts[0].user_id));
		const usergroup = getHighestUsergroup(author.data); // ? Get the highest usergroup

		const embedDecoration = generatePostEmbedDecoration(
			raw_posts,
			post,
			type
		);

		let e = new MessageEmbed({
			description: checkContent(),
			color: embedDecoration.color,
			title: embedDecoration.title,
			thumbnail: {
				url: `https://b.ppy.sh/thumb/${post.beatmapsets[0].id}l.jpg`,
			},
			footer: {
				iconURL: `https://a.ppy.sh/${post.posts[0].user_id}`,
				text: `${author.data.username} ${
					usergroup.name ? `(${usergroup.name})` : ""
				}`,
			},
		});

		message.reply({
			embeds: [e],
			allowedMentions: {
				repliedUser: false,
			},
		});

		function checkContent() {
			post.posts[0].message =
				`[Beatmap Page](https://osu.ppy.sh/s/${post.beatmapsets[0].id}) **|** [Mapper Profile](https://osu.ppy.sh/u/${post.beatmapsets[0].user_id})\n\n`.concat(
					post.posts[0].message
				);

			if (post.posts[0].message.length <= 2000)
				return post.posts[0].message;

			return post.posts[0].message.slice(0, 2000) + " **[truncated]**";
		}
	},
};
