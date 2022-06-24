/**
 * ! Currently not indexed (unusable) until it's fully finished
 */
import axios from "axios";
import { Client, Message, MessageEmbed } from "discord.js";
import UserNotFound from "../../responses/embeds/UserNotFound";
import getTraceParams from "../../helpers/commands/getTraceParams";
import osuApi from "../../helpers/osu/fetcher/osuApi";
import calculateFruitsScore from "../../helpers/osu/performance/calculateFruitsScore";
import calculateManiaScore from "../../helpers/osu/performance/calculateManiaScore";
import calculateOsuScore from "../../helpers/osu/performance/calculateOsuScore";
import calculateTaikoScore from "../../helpers/osu/performance/calculateTaikoScore";
import checkMessagePlayers from "../../helpers/osu/player/checkMessagePlayers";
import getEmoji from "../../helpers/text/getEmoji";
import RecentScoreEmbed from "../../responses/osu/RecentScoreEmbed";
import { GameModeName } from "../../types/game_mode";
import { Score } from "../../types/score";

export default {
	name: "recent",
	help: {
		description: "Check statistics for a player",
		syntax: "{prefix}player `<name|mention>` `<-?mode>`",
		example: "{prefix}player `sebola` `-osu`\n {prefix}player `@hivie` ",
	},
	category: "osu",
	run: async (bot: Client, message: Message, args: string[]) => {
		const params = getTraceParams(args, "-osu", 1, [
			"-osu",
			"-taiko",
			"-mania",
			"-catch",
		])[0];

		let mode: string | undefined = undefined;

		switch (params) {
			case "-osu": {
				mode = "osu";

				args.pop();
				break;
			}
			case "-taiko": {
				mode = "taiko";

				args.pop();
				break;
			}
			case "-catch": {
				mode = "fruits";

				args.pop();
				break;
			}
			case "-mania": {
				mode = "mania";

				args.pop();
				break;
			}
		}

		let { playerName, status } = await checkMessagePlayers(message, args);

		const player = await osuApi.fetch.user(playerName);

		if (player.status != 200)
			return message.reply({
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
			return message.reply({
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
			return message.reply({
				content: `**${player.data.username}** doesn't have any recent score`,
				allowedMentions: {
					repliedUser: false,
				},
			});

		RecentScoreEmbed.send(message, recent.data[0], player.data);
	},
};
