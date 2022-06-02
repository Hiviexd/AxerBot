import { Client, Message } from "discord.js";
import UserNotFound from "../../responses/embeds/UserNotFound";
import getTraceParams from "../../helpers/commands/getTraceParams";
import osuApi from "../../helpers/osu/fetcher/osuApi";
import checkMessagePlayers from "../../helpers/osu/player/checkMessagePlayers";
import PlayerEmbed from "../../responses/osu/PlayerEmbed";

export default {
	name: "player",
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

		let mode = "";

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

		const player = await osuApi.fetch.user(playerName, mode);

		if (status != 200)
			return message.reply({
				embeds: [UserNotFound],
				allowedMentions: {
					repliedUser: false,
				},
			});

		if (!player.data.is_active)
			return message.reply({
				embeds: [
					{
						title: "Umm...",
						description: `This user isn't active on this gamemode.`,
						color: "#ea6112",
					},
				],
				allowedMentions: {
					repliedUser: false,
				},
			});

		return PlayerEmbed.send(player, message, params.replace("-", ""));
	},
};
