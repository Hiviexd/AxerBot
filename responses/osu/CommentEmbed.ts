import {
	Message,
	MessageActionRow,
	MessageContextMenuInteraction,
	EmbedBuilder,
} from "discord.js";
import { ParsedComment } from "../../helpers/osu/url/parseComment";
import truncateString from "../../helpers/text/truncateString";
import colors from "../../constants/colors";

export default {
	async send(comment: ParsedComment, message: Message) {
		const labels = {
			build: "Go to changelog",
			news_post: "Go to news post",
			beatmapset: "Go to beatmap",
		};

		const buttons = new MessageActionRow();
		buttons.addComponents({
			type: "BUTTON",
			style: "LINK",
			label: labels[comment.postType],
			url: comment.url,
		});

		const embed = new EmbedBuilder({
			author: {
				name: comment.user.username,
				iconURL: comment.user.avatar_url,
				url: `https://osu.ppy.sh/users/${comment.user.id}`,
			},
			title: `${
				comment.type == "Comment"
					? `💬 Comment`
					: `🗨️ Reply ▶️ ${comment.repliedAuthor?.username}`
			}`,
			description: `**[${comment.title}](https://osu.ppy.sh/comments/${
				comment.id
			})**\n\n${truncateString(comment.content, 2048)}`,
			color: comment.type == "Comment" ? colors.pink : colors.purple,
			footer: {
				text: `+${comment.votes}`,
			},
			timestamp: new Date(comment.created_at),
		});

		message.reply({
			allowedMentions: {
				repliedUser: false,
			},
			embeds: [embed],
			components: [buttons],
		});
	},
	async sendInteraction(
		comment: ParsedComment,
		interaction: MessageContextMenuInteraction
	) {
		const labels = {
			build: "Go to changelog",
			news_post: "Go to news post",
			beatmapset: "Go to beatmap",
		};

		const buttons = new MessageActionRow();
		buttons.addComponents({
			type: "BUTTON",
			style: "LINK",
			label: labels[comment.postType],
			url: comment.url,
		});

		const embed = new EmbedBuilder({
			author: {
				name: comment.user.username,
				iconURL: comment.user.avatar_url,
				url: `https://osu.ppy.sh/users/${comment.user.id}`,
			},
			title: `${
				comment.type == "Comment"
					? `💬 Comment`
					: `🗨️ Reply ▶️ ${comment.repliedAuthor?.username}`
			}`,
			description: `**[${comment.title}](https://osu.ppy.sh/comments/${
				comment.id
			})**\n\n${truncateString(comment.content, 2048)}`,
			color: comment.type == "Comment" ? colors.pink : colors.purple,
			footer: {
				text: `+${comment.votes}`,
			},
			timestamp: new Date(comment.created_at),
		});

		interaction
			.reply({
				allowedMentions: {
					repliedUser: false,
				},
				embeds: [embed],
				components: [buttons],
			})
			.catch(console.error);
	},
};
