import { Client, Message } from "discord.js";
import MissingPermissions from "./../../data/embeds/MissingPermissions";
import { ownerId } from "../../config.json";
import { readdirSync } from "fs";
import path from "path";
import * as database from "./../../database";

export default {
	name: "cooldown",
	description: "applies a cooldown to a command category",
	syntax: "!cooldown `<channels>` `<categories>` `<cooldown>` `<increments>`",
	example: "!purge `6`",
	category: "moderation",
	run: async (bot: Client, message: Message, args: string[]) => {
		const categories = readdirSync(
			path.resolve(__dirname.concat("/../")),
			"utf8"
		); // Get categories

		// !cooldown <channels> <categories> <cooldown> <increments>

		if (!message.guild) return;

		const guild = await database.guilds.findOne({ _id: message.guildId });

		if (args.length == 4) {
			const params = {
				channels: args[0] ? args[0].split(",") : [""],
				categories: args[1] ? args[1].split(",") : [""],
				size: args[2],
				increments: args[3] || 0,
			};

			if (params.channels.length < 1 || params.categories.length < 1)
				return message.channel.send(
					"❗ Provide a channel/category"
				);

			// ? Support array to save requested channels
			let _channels: string[] = [];
			let _ends_at: any = {};
			params.channels.forEach((c) => {
				let ch = message.guild?.channels.cache.find(
					(channel) =>
						channel.name.toLowerCase() == c.toLowerCase() &&
						channel.type == "GUILD_TEXT"
				);

				if (ch) {
					_channels.push(ch.id);
					_ends_at[ch.id] = new Date();
				}
			});

			params.categories.forEach((c) => {
				if (categories.includes(c.toLowerCase())) {
					guild.cooldown[c] = {
						channels: _channels,
						ends_at: _ends_at,
						size: Number(params.size),
						current_increments: 0,
						increments: Number(params.increments),
					};
				}
			});

			await database.guilds.findOneAndUpdate({ _id: guild._id }, guild);

			console.log(guild.cooldown);

			message.channel.send("✅ Done ");
		} else {
			return message.channel.send(":x: Missing Arguments");
		}
	},
};
