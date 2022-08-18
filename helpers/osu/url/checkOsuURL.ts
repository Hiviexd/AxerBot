import { Message } from "discord.js";
import parseUser from "./parseUser";
import * as database from "../../../database";
import checkCooldown from "../../general/checkCooldown";
import parseDiscussionPost from "./parseDiscussionPost";
import parseBeatmap from "./parseBeatmap";
import osuTimestamp from "../../text/osuTimestamp";
import parseComment from "./parseComment";

export default async (message: Message) => {
	if (message.author.bot) return;

	const links: string[] = [];
	const args = message.content
		.toLowerCase()
		.trim()
		.replace(/\n/g, " ")
		.split(" ");
	const guild = await database.guilds.findOne({ _id: message.guildId });

	if (guild == null) return;

	if (guild.osuTimestamps) osuTimestamp(message);

	if (!(await checkCooldown(guild, "osu", message.channelId, message, true)))
		return;

	args.forEach((arg) => {
		if (arg.startsWith("https://osu.ppy.sh/")) links.push(arg);
	});

	function validateArg(arg: string) {
		if (!guild) return;
		if (!guild.embeds) return;

		const url = new URL(arg);

		// ? User link
		if (url.pathname.includes("users")) {
			if ((guild.embeds.player.all &&
					!guild.embeds.player.none) ||
				guild.embeds.player.channels.includes(message.channelId)
			) {
				return parseUser(arg, message);
			}
		}

		// ? Beatmap link
		if (
			url.pathname.includes("beatmapsets") &&
			!url.pathname.includes("discussion")
		) {
			if ((guild.embeds.beatmap.all &&
					!guild.embeds.beatmap.none) ||
				guild.embeds.beatmap.channels.includes(message.channelId)
			) {
				return parseBeatmap(arg, message);
			}
		}

		// ? Discussion link
		if (
			url.pathname.includes("discussion") &&
			!url.pathname.includes("reviews")
		) {
			if ((guild.embeds.discussion.all &&
					!guild.embeds.discussion.none) ||
				guild.embeds.discussion.channels.includes(message.channelId)
			) {
				return parseDiscussionPost(arg, message);
			}
		}

		// ? Comment link
		if (url.pathname.includes("comments")) {
			if ((guild.embeds.comment.all &&
					!guild.embeds.comment.none) ||
				guild.embeds.comment.channels.includes(message.channelId)
			) {
				return parseComment(arg, message);
			}
		}
	}

	links.forEach((link) => {
		validateArg(link.toLowerCase())
	});
};
