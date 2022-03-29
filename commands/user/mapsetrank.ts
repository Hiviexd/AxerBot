import { Client, Message } from "discord.js";
import UserNotFound from "../../data/embeds/UserNotFound";
import osuApi from "../../helpers/osu/fetcher/osuApi";
import UserNotMapper from "../../data/embeds/UserNotMapper";
import { Beatmapset } from "../../types/beatmap";
import MapsetRankEmbed from "../../responses/osu/MapsetRankEmbed";
import checkMessagePlayers from "../../helpers/osu/player/checkMessagePlayers";
import getTraceParams from "../../helpers/commands/getTraceParams";

export default {
	name: "mapsetrank",
	help: {
		description: "Displays beatmapset statistics of a user",
		syntax: "{prefix}mapsetrank `<user>` `<option>`",
		options: ["`-fav` | `-favorites`", "`-plays` | `-playcount`"],
		example:
			"{prefix}mapsetrank `Hivie` `-favorites`\n{prefix}mapsetrank `@Sebola`\n{prefix}mapsetrank",
	},
	category: "osu",
	run: async (bot: Client, message: Message, args: string[]) => {
		let sort = getTraceParams(args, "-playcount", 1, [
			"-favorites",
			"-fav",
			"-plays",
			"-playcount",
		])[0];

		let decorator = {
			title: "Most played beatmaps", // ? {username} | Most played beatmaps
			emoji: "▶", // ? {position} . {beatmap_link} | ▶
		};

		// ? Parse sort type
		switch (sort.toLowerCase()) {
			case "-favorites": {
				sort = "favourite_count";
				args.pop();

				decorator = {
					title: "Most favorited beatmaps",
					emoji: "❤",
				};

				break;
			}
			case "-fav": {
				sort = "favourite_count";
				args.pop();

				decorator = {
					title: "Most favorited beatmaps",
					emoji: "❤",
				};

				break;
			}
			case "-playcount": {
				sort = "play_count";
				args.pop();

				break;
			}
			case "-plays": {
				sort = "play_count";
				args.pop();
				break;
			}

			default: {
				sort = "play_count";
				break;
			}
		}

		let { playerName, status } = await checkMessagePlayers(message, args);

		if (status != 200) return;

		const mapper = await osuApi.fetch.user(encodeURI(playerName));

		if (mapper.status != 200)
			return message.channel.send({
				embeds: [UserNotFound],
			});

		const beatmaps = await osuApi.fetch.userBeatmaps(
			mapper.data.id.toString()
		);

		if (beatmaps.status != 200) return;

		if (beatmaps.data.sets.length < 1)
			return message.channel.send({
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
		MapsetRankEmbed.send(mapper, sorted_beatmaps, message, decorator);
	},
};
