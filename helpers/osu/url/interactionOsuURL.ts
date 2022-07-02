import { Interaction } from "discord.js";
import parseUser from "./parseUser";
import * as database from "../../../database";
import checkCooldown from "../../general/checkCooldown";
import parseDiscussionPost from "./parseDiscussionPost";
import parseBeatmap from "./parseBeatmap";
import osuTimestamp from "../../text/osuTimestamp";
import parseComment from "./parseComment";

export default async (interaction: Interaction, type: string) => {
	if (!interaction.isMessageContextMenu()) return;

	let links: string[] = [];

	const args = interaction.targetMessage.content
		.toLowerCase()
		.trim()
		.split(" ");

	args.forEach((arg) => {
		if (arg.startsWith("https://osu.ppy.sh/")) links.push(arg);
	});

	if (links.length < 1)
		return interaction.editReply({
			content: "This message does not have any osu! website url",
		});

	switch (type) {
		case "player": {
			links = links.filter((l) => l.split("/").includes("users"));

			break;
		}
		case "discussion": {
			links = links.filter(
				(l) =>
					l.split("/").includes("discussion") &&
					!l.includes("reviews")
			);

			break;
		}
		case "beatmap": {
			links = links.filter(
				(l) =>
					l.split("/").includes("beatmapsets") &&
					!l.includes("discussion")
			);

			break;
		}
		case "comment": {
			links = links.filter((l) => l.split("/").includes("comments"));

			break;
		}
	}

	if (links.length < 1)
		return interaction.editReply({
			content: `This message does not have any osu! ${type} url`,
		});

	links.splice(1, 9999);

	links.forEach((link) => {
		if (link.split("/").includes("users")) {
			return parseUser(link, undefined, interaction);
		}
		if (
			link.split("/").includes("beatmapsets") &&
			!link.includes("discussion")
		) {
			return parseBeatmap(link, undefined, interaction);
		}
		if (
			link.split("/").includes("discussion") &&
			!link.includes("reviews")
		) {
			return parseDiscussionPost(link, undefined, interaction);
		}

		if (link.split("/").includes("comments")) {
			return parseComment(link, undefined, interaction);
		}
	});
};
