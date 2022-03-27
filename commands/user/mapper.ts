import { Client, Message, MessageEmbed } from "discord.js";
import UserNotFound from "../../data/embeds/UserNotFound";
import osuApi from "../../utils/osu/osuApi";
import UserNotMapper from "../../data/embeds/UserNotMapper";
import * as database from "./../../database";
import MapperEmbed from "../../messages/osu/MapperEmbed";

export default {
	name: "mapper",
	description: "Displays mapper statistics of a user",
	syntax: "!mapper `<user>`",
	example: "!mapper `Hivie`\n!mapper",
	category: "osu",
	run: async (bot: Client, message: Message, args: Array<string>) => {
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
			return message.channel.send("❗ Provide a valid user.");

		const mapper_user = await osuApi.fetch.user(encodeURI(mapper_name));

		if (mapper_user.status != 200)
			return message.channel.send({
				embeds: [UserNotFound],
			});

		const mapper_beatmaps = await osuApi.fetch.userBeatmaps(
			mapper_user.data.id.toString()
		);

		if (mapper_beatmaps.status != 200) return;

		if (mapper_beatmaps.data.sets.length < 1)
			return message.channel.send({
				embeds: [UserNotMapper],
			});

		MapperEmbed.send(mapper_user, mapper_beatmaps, message);
	},
};
