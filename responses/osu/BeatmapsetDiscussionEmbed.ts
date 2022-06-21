import { BeatmapsetDiscussionPost } from "../../types/beatmap";
import {
	Message,
	MessageActionRow,
	MessageAttachment,
	MessageButton,
	MessageContextMenuInteraction,
	MessageEmbed,
} from "discord.js";
import getHighestUsergroup from "../../helpers/osu/player/getHighestUsergroup";
import osuApi from "../../helpers/osu/fetcher/osuApi";
import generatePostEmbedDecoration from "../../helpers/text/embeds/generatePostEmbedDecoration";
import storeBeatmap from "../../helpers/osu/fetcher/general/storeBeatmap";
import truncateString from "../../helpers/text/truncateString";
import { DiscussionAttributtes } from "../../helpers/osu/url/getTargetDiscussionPost";
import replaceOsuTimestampsToURL from "../../helpers/text/replaceOsuTimestampsToURL";
import getEmoji from "../../helpers/text/getEmoji";

export default {
	send: async (
		post: DiscussionAttributtes,
		raw_posts: BeatmapsetDiscussionPost,
		type: string,
		message: Message,
		url: string
	) => {
		if (post.posts.length < 1) return;
		const author = await osuApi.fetch.user(String(post.posts[0].user_id));
		const usergroup = getHighestUsergroup(author.data); // ? Get the highest usergroup

		const embedDecoration = generatePostEmbedDecoration(
			raw_posts,
			post,
			type
		);

		const beatmap = await osuApi.fetch.beatmapset(
			post.beatmapsets[0].id.toString()
		);

		if (!beatmap.data.beatmaps) return;

		const metadata = `
		**[${post.beatmapsets[0].artist} - ${post.beatmapsets[0].title}](${url})**
		${getEmoji(beatmap.data.beatmaps[0].mode)} Mapped by [**${
			post.beatmapsets[0].creator
		}**](https://osu.ppy.sh/users/${post.beatmapsets[0].user_id})\n\n`;

		let e = new MessageEmbed({
			description: replaceOsuTimestampsToURL(
				truncateString(metadata.concat(post.posts[0].message), 4096)
			),
			color: embedDecoration.color,
			title: embedDecoration.title,
			thumbnail: {
				url: `https://b.ppy.sh/thumb/${post.beatmapsets[0].id}l.jpg`,
			},
			author: {
				iconURL: `https://a.ppy.sh/${post.posts[0].user_id}`,
				url: `https://osu.ppy.sh/users/${post.posts[0].user_id}`,
				name: `${author.data.username} ${
					usergroup.name ? `(${usergroup.name})` : ""
				}`,
			},
			timestamp: new Date(post.posts[0].created_at),
		});

		const buttons = new MessageActionRow();

		try {
			const beatmap_file = await osuApi.download.beatmapset(
				post.beatmapsets[0].id.toString()
			);

			const stored_file = await storeBeatmap(
				beatmap_file,
				post.beatmapsets[0],
				message
			);

			if (!stored_file.big) {
				buttons.addComponents([
					new MessageButton({
						type: "BUTTON",
						style: "LINK",
						url: stored_file.url,
						label: "Download Beatmap",
					}),
				]);
			}
		} catch (e) {
			console.error(e);
		}

		if (beatmap.status == 200 && beatmap.data.beatmaps) {
			buttons.addComponents([
				new MessageButton({
					type: "BUTTON",
					style: "LINK",
					url: `https://axer-url.herokuapp.com/dl/${beatmap.data.beatmaps[0].id}`,
					label: "osu!direct",
				}),
			]);
		}

		message.reply({
			embeds: [e],
			components: [buttons],
			allowedMentions: {
				repliedUser: false,
			},
		});
	},
	sendInteraction: async (
		post: DiscussionAttributtes,
		raw_posts: BeatmapsetDiscussionPost,
		type: string,
		interaction: MessageContextMenuInteraction,
		url: string
	) => {
		if (post.posts.length < 1) return;
		const author = await osuApi.fetch.user(String(post.posts[0].user_id));
		const usergroup = getHighestUsergroup(author.data); // ? Get the highest usergroup

		const embedDecoration = generatePostEmbedDecoration(
			raw_posts,
			post,
			type
		);

		const beatmap = await osuApi.fetch.beatmapset(
			post.beatmapsets[0].id.toString()
		);

		if (!beatmap.data.beatmaps) return;

		const metadata = `
		**[${post.beatmapsets[0].artist} - ${post.beatmapsets[0].title}](${url})**
		${getEmoji(beatmap.data.beatmaps[0].mode)} Mapped by [**${
			post.beatmapsets[0].creator
		}**](https://osu.ppy.sh/users/${post.beatmapsets[0].user_id})\n\n`;

		let e = new MessageEmbed({
			description: replaceOsuTimestampsToURL(
				truncateString(metadata.concat(post.posts[0].message), 4096)
			),
			color: embedDecoration.color,
			title: embedDecoration.title,
			thumbnail: {
				url: `https://b.ppy.sh/thumb/${post.beatmapsets[0].id}l.jpg`,
			},
			author: {
				iconURL: `https://a.ppy.sh/${post.posts[0].user_id}`,
				url: `https://osu.ppy.sh/users/${post.posts[0].user_id}`,
				name: `${author.data.username} ${
					usergroup.name ? `(${usergroup.name})` : ""
				}`,
			},
			timestamp: new Date(post.posts[0].created_at),
		});

		const buttons = new MessageActionRow();

		if (beatmap.status == 200 && beatmap.data.beatmaps) {
			buttons.addComponents([
				new MessageButton({
					type: "BUTTON",
					style: "LINK",
					url: `https://axer-url.herokuapp.com/dl/${beatmap.data.beatmaps[0].id}`,
					label: "osu!direct",
				}),
			]);
		}

		interaction
			.reply({
				embeds: [e],
				components: [buttons],
				allowedMentions: {
					repliedUser: false,
				},
				ephemeral: true,
			})
			.catch(console.error);
	},
};
