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

	osuTimestamp(message);

	if (!(await checkCooldown(guild, "osu", message.channelId, message, true)))
		return;

	args.forEach((arg) => {
		if (arg.startsWith("https://osu.ppy.sh/")) links.push(arg);
	});

	links.forEach((link) => {
		if (link.split("/").includes("users")) {
			if (
				(guild.embeds &&
					guild.embeds.player.all &&
					!guild.embeds.player.none) ||
				guild.embeds.player.channels.includes(message.channelId)
			) {
				return parseUser(link, message);
			}
		}

		if (
			link.split("/").includes("beatmapsets") &&
			!link.includes("discussion")
		) {
			if (
				(guild.embeds &&
					guild.embeds.beatmap.all &&
					!guild.embeds.beatmap.none) ||
				guild.embeds.beatmap.channels.includes(message.channelId)
			) {
				return parseBeatmap(link, message);
			}
		}
		if (
			link.split("/").includes("discussion") &&
			!link.includes("reviews")
		) {
			if (
				(guild.embeds &&
					guild.embeds.discussion.all &&
					!guild.embeds.discussion.none) ||
				guild.embeds.discussion.channels.includes(message.channelId)
			) {
				return parseDiscussionPost(link, message);
			}
		}

		if (link.split("/").includes("comments")) {
			if (
				(guild.embeds &&
					guild.embeds.comment.all &&
					!guild.embeds.comment.none) ||
				guild.embeds.comment.channels.includes(message.channelId)
			) {
				return parseComment(link, message);
			}
		}
	});
};
