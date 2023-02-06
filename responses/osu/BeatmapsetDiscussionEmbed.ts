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
import generateColoredModeIcon from "../../helpers/text/generateColoredModeIcon";
import { QatEvent } from "types/qat";

export default {
	send: async (
		post: DiscussionAttributtes,
		raw_posts: BeatmapsetDiscussionPost,
		type: string,
		qatData: QatEvent | undefined,
		message: Message,
		url: string
	) => {
		if (post.posts.length < 1) return;
		const author = await osuApi.fetch.user(String(post.posts[0].user_id));
		const usergroup = getHighestUsergroup(author.data); // ? Get the highest usergroup

		const embedDecoration = generatePostEmbedDecoration(
			raw_posts,
			post,
			qatData,
			type
		);

		const beatmap = await osuApi.fetch.beatmapset(
			post.beatmapsets[0].id.toString()
		);

		if (!beatmap.data.beatmaps) return;

		const metadata = `
		**[${post.beatmapsets[0].artist} - ${
			post.beatmapsets[0].title
		}](${url})**\n${generateModeIcon()} Mapped by [${
			post.beatmapsets[0].creator
		}](https://osu.ppy.sh/users/${post.beatmapsets[0].user_id})\n\n`;

		function generateModeIcon() {
			if (!beatmap.data.beatmaps) return;

			const beatmapData = beatmap.data.beatmaps.find(
				(b) => b.id == post.discussions[0].beatmap_id
			);

			if (!post.discussions[0].beatmap_id || !beatmapData) {
				return getEmoji(beatmap.data.beatmaps[0].mode);
			}
			return generateColoredModeIcon(
				beatmapData?.mode,
				beatmapData?.difficulty_rating
			);
		}

		function getPostLocation() {
			if (!post.discussions[0].beatmap_id)
				return "General (All difficulties)";

			if (!beatmap.data.beatmaps) return "General (All difficulties)";

			const beatmapData = beatmap.data.beatmaps.find(
				(b) => b.id == post.discussions[0].beatmap_id
			);

			if (!beatmapData) return "General (All difficulties)";

			if (url.includes("general") && !url.includes("generalAll"))
				return `General (${beatmapData.version})`;

			if (url.includes("timeline"))
				return `Timeline (${beatmapData.version})`;
		}

		let e = new MessageEmbed({
			description: replaceOsuTimestampsToURL(
				truncateString(metadata.concat(post.posts[0].message), 1024)
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
					usergroup.name ? `(${usergroup.short_name})` : ""
				}`,
			},
			footer: {
				text: `${getPostLocation()}`,
			},
			timestamp: new Date(post.posts[0].created_at),
		});

		const buttons = new MessageActionRow();

		// try {
		// 	const beatmap_file = await osuApi.download.beatmapset(
		// 		post.beatmapsets[0].id.toString()
		// 	);

		// 	const stored_file = await storeBeatmap(
		// 		beatmap_file,
		// 		post.beatmapsets[0],
		// 		message
		// 	);

		// 	if (!stored_file.big) {
		// 		buttons.addComponents([
		// 			new MessageButton({
		// 				type: "BUTTON",
		// 				style: "LINK",
		// 				url: stored_file.url,
		// 				label: "Download Beatmap",
		// 			}),
		// 		]);
		// 	}
		// } catch (e) {
		// 	console.error(e);
		// }

		if (beatmap.status == 200 && beatmap.data.beatmaps) {
			buttons.addComponents([
				new MessageButton({
					type: "BUTTON",
					style: "LINK",
					url: `https://axer-url.ppy.tn/dl/${beatmap.data.beatmaps[0].id}`,
					label: "osu!direct",
				}),
				new MessageButton({
					type: "BUTTON",
					style: "PRIMARY",
					customId: `beatmap_download|${beatmap.data.id}`,
					label: "Quick download",
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
			undefined,
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
				truncateString(metadata.concat(post.posts[0].message), 2048)
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
					url: `https://axer-url.ppy.tn/dl/${beatmap.data.beatmaps[0].id}`,
					label: "osu!direct",
				}),
				new MessageButton({
					type: "BUTTON",
					style: "PRIMARY",
					label: "Quick Download",
					customId: `beatmap_download|${beatmap.data.id}`,
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
			})
			.catch(console.error);
	},
};
