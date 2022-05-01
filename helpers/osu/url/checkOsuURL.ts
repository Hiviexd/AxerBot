import { Message } from "discord.js";
import parseUser from "./parseUser";
import * as database from "../../../database";
import checkCooldown from "../../general/checkCooldown";
import parseDiscussionPost from "./parseDiscussionPost";
import parseBeatmap from "./parseBeatmap";
import osuTimestamp from "../../text/osuTimestamp";

export default async (message: Message) => {
	if (message.author.bot) return;
	const links: string[] = [];
	const args = message.content.toLowerCase().trim().split(" ");
	const guild = await database.guilds.findOne({ _id: message.guildId });

	if (guild == null) return;

	osuTimestamp(message);

	if (!(await checkCooldown(guild, "osu", message.channelId, message, true)))
		return;

	args.forEach((arg) => {
		if (arg.startsWith("https://osu.ppy.sh/")) links.push(arg);
	});

	links.forEach((link) => {
		if (link.split("/").includes("users")) return parseUser(link, message);

		if (
			link.split("/").includes("beatmapsets") &&
			!link.includes("discussion")
		)
			return /*parseBeatmap(link, message)*/;
			//? temporarily disabling map embeds until i figure out a way to toggle on each embed on its own
		if (link.split("/").includes("discussion") && !link.includes("reviews"))
			return parseDiscussionPost(link, message);
	});
};
