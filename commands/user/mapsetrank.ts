import { Client, Message, MessageEmbed } from "discord.js";
import UserNotFound from "../../data/embeds/UserNotFound";
import osuApi from "../../utils/osu/osuApi";
import getUserGroup from "./utils/getUserGroup";
import UserNotMapper from "../../data/embeds/UserNotMapper";
import * as database from "./../../database";

export default {
	name: "mapsetrank",
	description: "Displays beatmapset statistics of a user",
	syntax: "!mapsetrank `<user>` `-rank_type`",
	example:
		"!mapsetrank `Hivie` `-favourites`\n!mapsetrank `@Sebola`\n!mapsetrank",
	category: "osu",
	run: async (bot: Client, message: Message, args: Array<string>) => {
		let sort = args[args.length - 1] || "-playcount";
		let decorator = {
			title: "Most played beatmaps",
			emoji: "▶",
		};

		message.channel.sendTyping();

		switch (sort.toLowerCase()) {
			case "-favourites": {
				sort = "favourite_count";
				args.pop();

				decorator = {
					title: "Most favourited beatmaps",
					emoji: "❤",
				};

				break;
			}
			case "-fav": {
				sort = "favourite_count";
				args.pop();

				decorator = {
					title: "Most favourited beatmaps",
					emoji: "❤",
				};

				break;
			}
			case "-playcount": {
				sort = "play_count";
				args.pop();

				break;
			}
			case "-play": {
				sort = "play_count";
				args.pop();
				break;
			}

			default: {
				sort = "play_count";
				break;
			}
		}

		let mapper_name = args.join(" ");

		if (message.mentions.users.size != 1) {
			if (args.length < 1) {
				const u = await database.users.findOne({
					_id: message.author.id,
				});

				if (u != null) mapper_name = u.osu.username;
			}
		} else {
			const user = message.mentions.users.first();
			const u = await database.users.findOne({
				_id: user?.id,
			});

			if (u != null) mapper_name = u.osu.username;
		}

		if (mapper_name.trim() == "")
			return message.channel.send("Provide a valid user.");

		const mapper_user = await osuApi.fetch.user(encodeURI(mapper_name));

		if (mapper_user.status != 200)
			return message.channel.send({
				embeds: [UserNotFound],
			});

		const mapper_beatmaps = await osuApi.fetch.userBeatmaps(
			mapper_user.data.id
		);

		if (mapper_beatmaps.status != 200) return;

		if (mapper_beatmaps.data.sets.length < 1)
			return message.channel.send({
				embeds: [UserNotMapper],
			});

		const usergroup = getUserGroup(mapper_user.data);

		const sorted_beatmaps: Array<any> = mapper_beatmaps.data.sets;
		let beatmaps_string = "";

		switch (sort) {
			case "favourite_count": {
				sorted_beatmaps.sort((a, b) => {
					return (
						Number(b.favourite_count) - Number(a.favourite_count)
					);
				});

				generateText();

				break;
			}
			case "play_count": {
				sorted_beatmaps.sort((a, b) => {
					return Number(b.play_count) - Number(a.play_count);
				});

				generateText();

				break;
			}
		}

		function generateText() {
			let size = 0;
			sorted_beatmaps.map((b) => {
				if (size < 10) {
					size++;
					return (beatmaps_string = beatmaps_string.concat(
						`**${size}** • [${b.artist} - ${
							b.title
						}](https://osu.ppy.sh/s/${b.id}) | ${
							decorator.emoji
						} ${b[sort].toLocaleString("en-US")} \n`
					));
				}
			});
		}

		let e = new MessageEmbed({
			thumbnail: {
				url: `https://a.ppy.sh/${mapper_user.data.id}`,
			},
			color: usergroup.colour,
			description: beatmaps_string,
			author: {
				name: `${mapper_user.data.username} ${usergroup.name} | ${decorator.title}`,
				url: `https://osu.ppy.sh/users/${mapper_user.data.id}`,
				iconURL: usergroup.icon,
			},
		});

		message.channel.send({
			embeds: [e],
		});
	},
};
