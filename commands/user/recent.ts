/**
 * ! Currently not indexed (unusable) until it's fully finished
 */
import axios from "axios";
import { Client, CommandInteraction, Message, MessageEmbed } from "discord.js";
import UserNotFound from "../../responses/embeds/UserNotFound";
import getTraceParams from "../../helpers/commands/getTraceParams";
import osuApi from "../../helpers/osu/fetcher/osuApi";
import checkMessagePlayers from "../../helpers/osu/player/checkMessagePlayers";
import getEmoji from "../../helpers/text/getEmoji";
import RecentScoreEmbed from "../../responses/osu/RecentScoreEmbed";
import { GameModeName } from "../../types/game_mode";
import { Score } from "../../types/score";
import checkCommandPlayers from "../../helpers/osu/player/checkCommandPlayers";

export default {
	name: "recent",
	help: {
		description: "Check statistics for a player",
		syntax: "{prefix}player `<name|mention>` `<-?mode>`",
		example: "{prefix}player `sebola` `-osu`\n {prefix}player `@hivie` ",
	},
	category: "osu",
	config: {
		type: 1,
		options: [
			{
				name: "username",
				description: "By osu! username",
				type: 3,
				max_value: 1,
			},
            {
				name: "usermention",
				description: "By user mention (This doesn't ping the user)",
				type: 6,
				max_value: 1,
			},
			{
				name: "mode",
				description: "Gamemode info to view",
				type: 3,
				max_value: 1,
				choices: [
					{
						name: "osu",
						value: "osu",
					},
					{
						name: "taiko",
						value: "taiko",
					},
					{
						name: "catch",
						value: "fruits",
					},
					{
						name: "mania",
						value: "mania",
					},
				],
			},
		],
	},
	interaction: true,
	run: async (bot: Client, command: CommandInteraction, args: string[]) => {
		await command.deferReply();

		const modeInput = command.options.get("mode");
		const mode = modeInput ? modeInput.value?.toString() : undefined;

		let { playerName, status } = await checkCommandPlayers(command);

		const player = await osuApi.fetch.user(playerName);

		if (player.status != 200)
			return command.editReply({
				embeds: [UserNotFound],
				allowedMentions: {
					repliedUser: false,
				},
			});

		const recent = await osuApi.fetch.userRecent(
			player.data.id.toString(),
			mode
		);

		if (status != 200)
			return command.editReply({
				embeds: [UserNotFound],
				allowedMentions: {
					repliedUser: false,
				},
			});

		if (
			!recent.data[0] ||
			!recent.data[0].user ||
			!recent.data[0].beatmapset ||
			!recent.data[0].beatmap
		)
			return command.editReply({
				content: `**${player.data.username}** doesn't have any recent scores`,
				allowedMentions: {
					repliedUser: false,
				},
			});

		RecentScoreEmbed.reply(command, recent.data[0], player.data);
	},
};
