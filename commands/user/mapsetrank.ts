import { Client, Message, MessageEmbed } from "discord.js";
import UserNotFound from "../../data/embeds/UserNotFound";
import osuApi from "../../utils/osu/osuApi";
import UserNotMapper from "../../data/embeds/UserNotMapper";
import * as database from "./../../database";
import { Beatmapset } from "../../types/beatmap";
import MapsetRankEmbed from "../../messages/osu/MapsetRankEmbed";

export default {
	name: "mapsetrank",
	description: "Displays beatmapset statistics of a user",
	syntax: "!mapsetrank `<user>` `<option>`",
	options: ["`-fav` | `-favorites`", "`-plays` | `-playcount`"],
	example:
		"!mapsetrank `Hivie` `-favorites`\n!mapsetrank `@Sebola`\n!mapsetrank",
	category: "osu",
	run: async (bot: Client, message: Message, args: string[]) => {
		let sort = args[args.length - 1] || "-playcount";
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

		let mapper_name = args.join(" "); // ? First, will we try to use the passed argument as the username

		// ? If mentions, try to use the author username saved in the db
		if (message.mentions.users.size != 1) {
			// ? Only use the message author if no arguments
			if (args.length < 1) {
				const u = await database.users.findOne({
					_id: message.author.id,
				});

				// ? If exists, overwrite the passed argument to the mentioned user name
				if (u != null) mapper_name = u.osu.username;
			}
		} else {
			// ? Else, try to use the mention
			const user = message.mentions.users.first();
			const u = await database.users.findOne({
				_id: user?.id,
			});

			// ? If exists, overwrite too
			if (u != null) mapper_name = u.osu.username;
		}

		// ? If all the arguments failed, and the passed argument text is null (!mapsetrank {username}), send a error embed

		if (mapper_name.trim() == "")
			return message.channel.send("Provide a valid user.");

		// ? Oh everything works, fetch the user
		const mapper_user = await osuApi.fetch.user(encodeURI(mapper_name));

		// ? that shit isnt a user response?
		if (mapper_user.status != 200)
			return message.channel.send({
				embeds: [UserNotFound],
			});

		// ? Oh yeah fetch beatmaps
		const mapper_beatmaps = await osuApi.fetch.userBeatmaps(
			mapper_user.data.id.toString()
		);

		// ? If error, return.
		if (mapper_beatmaps.status != 200) return;

		// ? This user doesnt have any beatmap bro
		if (mapper_beatmaps.data.sets.length < 1)
			return message.channel.send({
				embeds: [UserNotMapper],
			});

		// ? Sort beatmaps
		const sorted_beatmaps: Beatmapset[] = mapper_beatmaps.data.sets;
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
		MapsetRankEmbed.send(mapper_user, sorted_beatmaps, message, decorator);
	},
};
