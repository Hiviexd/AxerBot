import { BeatmapsetDiscussionPost } from "../../types/beatmap";
import { Message, MessageEmbed } from "discord.js";
import parseUsergroup from "../../utils/osu/user/parseUsergroup";
import osuApi from "../../utils/osu/osuApi";

export default {
	send: async (
		post: BeatmapsetDiscussionPost,
		raw_posts: BeatmapsetDiscussionPost,
		message: Message
	) => {
		if (post.posts.length < 1) return;
		const author = await osuApi.fetch.user(String(post.posts[0].user_id));
		const usergroup = parseUsergroup(author.data); // ? Get the highest usergroup

		const post_types: any = {
			praise: {
				name: "Praise",
				emoji: "<:praise:957733966947966976>",
			},
			hype: {
				name: "Hype",
				emoji: "<:hype:957733964712394812>",
			},
			problem: {
				name: "Problem",
				emoji: "<:problem:957733964586561617>",
			},
			suggestion: {
				name: "Suggestion",
				emoji: "<:suggestion:957733964628521053>",
			},
			mapper_note: {
				name: "Note",
				emoji: "<:mapper_note:957733964611731466>",
			},
			reply: {
				name: "Reply",
				emoji: "<:message1:957738115076857856>",
			},
		};

		let e = new MessageEmbed({
			description: checkContent(),
			color: parseEmbedDecoration().color,
			title: parseEmbedDecoration().title,
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

		function parseEmbedDecoration() {
			if (raw_posts.posts.length > 1)
				return {
					color: "#ffffff",
					title: `${post_types["reply"].emoji}  ${post_types["reply"].name}`,
				};

			const colors: any = {
				suggestion: "#c6a132",
				problem: "#c33c33",
				hype: "#3399cc",
				praise: "#3399cc",
				resolved: "#80cc33",
				mapper_note: "#6851b6",
			};

			if (post.discussions[0].resolved)
				return {
					color: colors["resolved"],
					title: `${
						post_types[post.discussions[0].message_type].emoji
					} <:resolved:957733964649480252>  Closed ${
						post.discussions[0].message_type
					} `,
				};

			return {
				color: colors[post.discussions[0].message_type],
				title: `${
					post_types[post.discussions[0].message_type].emoji
				}  ${post_types[post.discussions[0].message_type].name}`,
			};
		}
	},
};
