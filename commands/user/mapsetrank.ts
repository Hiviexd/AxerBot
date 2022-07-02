import {
	ApplicationCommandManager,
	Client,
	CommandInteraction,
	Message,
} from "discord.js";
import UserNotFound from "../../responses/embeds/UserNotFound";
import osuApi from "../../helpers/osu/fetcher/osuApi";
import UserNotMapper from "../../responses/embeds/UserNotMapper";
import { Beatmapset } from "../../types/beatmap";
import MapsetRankEmbed from "../../responses/osu/MapsetRankEmbed";
import checkMessagePlayers from "../../helpers/osu/player/checkMessagePlayers";
import getTraceParams from "../../helpers/commands/getTraceParams";
import checkCommandPlayers from "../../helpers/osu/player/checkCommandPlayers";

export default {
	name: "mapsetrank",
	help: {
		description: "Displays beatmapset statistics of a user",
		syntax: "{prefix}mapsetrank `<user>` `<option>`",
		options: ["`-favs` | `-favorites`", "`-plays` | `-playcount`"],
		example:
			"{prefix}mapsetrank `Hivie` `-favs`\n{prefix}mapsetrank <@341321481390784512>\n{prefix}mapsetrank",
		note: "You won't need to specify your username if you set yourself up with this command:\n`{prefix}osuset user <username>`",
	},
	config: {
		type: 1,
		options: [
			{
				name: "user",
				description: "By user mention (This doesn't ping the user)",
				type: 6,
				max_value: 1,
			},
			{
				name: "username",
				description: "By osu! username",
				type: 3,
				max_value: 1,
			},
			{
				name: "sort",
				description: "Sort type",
				type: 3,
				max_value: 1,
				choices: [
					{
						name: "favorites",
						value: "favourite_count",
					},
					{
						name: "plays",
						value: "play_count",
					},
				],
			},
		],
	},
	category: "osu",
	interaction: true,
	run: async (bot: Client, command: CommandInteraction, args: string[]) => {
		await command.deferReply();

		let sort = command.options.get("sort")
			? command.options.get("sort")?.value
			: "play_count";

		let decorator = {
			title: "Most played beatmaps", // ? {username} | Most played beatmaps
			emoji: "▶", // ? {position} . {beatmap_link} | ▶
		};

		let { playerName, status } = await checkCommandPlayers(command);

		if (status != 200) return;

		const mapper = await osuApi.fetch.user(encodeURI(playerName));

		if (mapper.status != 200)
			return command.editReply({
				embeds: [UserNotFound],
			});

		const beatmaps = await osuApi.fetch.userBeatmaps(
			mapper.data.id.toString()
		);

		if (beatmaps.status != 200) return;

		if (beatmaps.data.sets.length < 1)
			return command.editReply({
				embeds: [UserNotMapper],
			});

		// ? Sort beatmaps
		const sorted_beatmaps: Beatmapset[] = beatmaps.data.sets;
		switch (sort) {
			case "favourite_count": {
				sorted_beatmaps.sort((a, b) => {
					return (
						Number(b.favourite_count) - Number(a.favourite_count)
					);
				});

				break;
			}
			case "play_count": {
				sorted_beatmaps.sort((a, b) => {
					return Number(b.play_count) - Number(a.play_count);
				});

				break;
			}
		}

		// ? Lesgoooo send the embed
		MapsetRankEmbed.reply(mapper, sorted_beatmaps, command, decorator);
	},
};
