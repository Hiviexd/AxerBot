import {
	Message,
	MessageActionRow,
	MessageContextMenuInteraction,
	MessageEmbed,
} from "discord.js";
import { ParsedComment } from "../../helpers/osu/url/parseComment";
import truncateString from "../../helpers/text/truncateString";

export default {
	async send(comment: ParsedComment, message: Message) {
		const labels = {
			build: "Go to changelog",
			news_post: "Go to news post",
			beatmapset: "Go to beatmapset",
		};

		const buttons = new MessageActionRow();
		buttons.addComponents({
			type: "BUTTON",
			style: "LINK",
			label: labels[comment.postType],
			url: comment.url,
		});

		function getFooter() {
			if (comment.type == "Reply")
				return `+${comment.votes} | Replying to ${comment.repliedAuthor?.username} | ${comment.title}`;

			return `+${comment.votes} | ${comment.type} | ${comment.title}`;
		}

		const embed = new MessageEmbed({
			author: {
				name: comment.user.username,
				iconURL: comment.user.avatar_url,
				url: `https://osu.ppy.sh/users/${comment.user.id}`,
			},
			description: truncateString(comment.content, 4096),
			color: comment.type == "Comment" ? "#f45592" : "#5639ac",
			footer: {
				text: getFooter(),
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
			beatmapset: "Go to beatmapset",
		};

		const buttons = new MessageActionRow();
		buttons.addComponents({
			type: "BUTTON",
			style: "LINK",
			label: labels[comment.postType],
			url: comment.url,
		});

		function getFooter() {
			if (comment.type == "Reply")
				return `+${comment.votes} | Replying to ${comment.repliedAuthor?.username} | ${comment.title}`;

			return `+${comment.votes} | ${comment.type} | ${comment.title}`;
		}

		const embed = new MessageEmbed({
			author: {
				name: comment.user.username,
				iconURL: comment.user.avatar_url,
				url: `https://osu.ppy.sh/users/${comment.user.id}`,
			},
			description: truncateString(comment.content, 4096),
			color: comment.type == "Comment" ? "#f45592" : "#5639ac",
			footer: {
				text: getFooter(),
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
				ephemeral: true,
			})
			.catch(console.error);
	},
};
