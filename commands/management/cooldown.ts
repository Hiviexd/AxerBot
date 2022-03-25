import { Client, Message, MessageEmbed } from "discord.js";
import MissingPermissions from "./../../data/embeds/MissingPermissions";
import { ownerId } from "../../config.json";
import * as database from "./../../database";
import * as cooldownClear from "./subcommands/cooldown/cooldownClear";
import * as cooldownRemove from "./subcommands/cooldown/cooldownRemove";

export default {
	name: "cooldown",
	description: "applies a cooldown to a command category",
	syntax: "!cooldown `<channels>` `<categories>` `<cooldown>` `<increments>`",
	example: "!cooldown `general,offtopic` `fun,osu` `10` `5`",
	category: "management",
	subcommands: [cooldownClear, cooldownRemove],
	options: ["`?clear`", "`?remove`"],
	run: async (bot: Client, message: Message, args: string[]) => {
		const categories = ["contests", "fun", "misc", "management", "osu"]; // Get categories

		// !cooldown <channels> <categories> <cooldown> <increments>

		if (!message.guild) return;

		if (!message.member?.permissions.has("MANAGE_CHANNELS", true))
			return message.channel.send({ embeds: [MissingPermissions] });

		const guild = await database.guilds.findOne({ _id: message.guildId });

		if (args.length == 0) return sendCurrentConfiguration();

		if (args.length == 4) {
			const params = {
				channels: args[0] ? args[0].split(",") : [""],
				categories: args[1] ? args[1].split(",") : [""],
				size: Number(args[2]),
				increments: Number(args[3]) || 0,
			};

			if (
				isNaN(params.size) ||
				isNaN(params.increments) ||
				params.size == 0
			)
				return message.channel.send(
					"❗ Invalid cooldown/increments size value. Provide a valid number."
				);

			if (params.channels.length < 1 || params.categories.length < 1)
				return message.channel.send("❗ Provide a channel/category");

			// ? Support array to save requested channels
			let _channels: string[] = [];
			let _current_increments: any = {};
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
					_current_increments[ch.id] = 0;
				}

				return void {};
			});

			if (_channels.length < 1)
				return message.channel.send(
					"❗ Channels not found! Provide valid channels."
				);

			// ? Check the provided categories
			const _categories: string[] = [];
			params.categories.forEach((c) => {
				if (categories.includes(c)) _categories.push(c.toLowerCase());
			});

			if (_categories.length < 1)
				return message.channel.send(
					`❗ Invalid provided categories, use \`${guild.prefix}help cooldown\` to all categories.`
				);

			params.categories.forEach((c) => {
				if (categories.includes(c.toLowerCase())) {
					if (guild.cooldown[c].channels.length < 1) {
						guild.cooldown[c] = {
							channels: _channels,
							ends_at: _ends_at,
							size: params.size,
							current_increments: _current_increments,
							increments: params.increments,
						};
					} else {
						_channels.push.apply(
							_channels,
							guild.cooldown[c].channels
						);

						let unique_channels: any[] = [];
						_channels.forEach((c) => {
							if (!unique_channels.includes(c)) {
								unique_channels.push(c);
							}

							return void {};
						});

						guild.cooldown[c] = {
							channels: unique_channels,
							ends_at: _ends_at,
							size: params.size,
							current_increments: _current_increments,
							increments: params.increments,
						};
					}
				}
			});

			await database.guilds.findOneAndUpdate({ _id: guild._id }, guild);

			message.channel.send("✅ Done");
		} else {
			switch (args[0].toLowerCase()) {
				case "clear": {
					cooldownClear.run(message, args);
					break;
				}

				case "remove": {
					cooldownRemove.run(message, args);
					break;
				}

				default: {
					message.channel.send(
						`:x: Missing Arguments, use \`${guild.prefix}help cooldown\` to more information.`
					);

					break;
				}
			}
		}

		function sendCurrentConfiguration() {
			let embed: any = {
				title: "Active cooldowns",
				description: "Category | Length | Increments | Channels\n\n",
			};

			// ? Support array to save configured categories
			const configured: any[] = [];

			// ? Process provided categories
			Object.keys(guild.cooldown).forEach((option) => {
				if (
					categories.includes(option) &&
					guild.cooldown[option].size != 0
				) {
					// ? Add a field to get the category name
					guild.cooldown[option]["name"] = option;

					// ? Changes -1 to "Disabled"
					if (guild.cooldown[option].size < 0)
						guild.cooldown[option].size = "Disabled";

					configured.push(guild.cooldown[option]);
				}

				return void {};
			});

			if (configured.length < 1)
				return message.channel.send({
					embeds: [
						{
							title: "Huh?",
							description: "Configure a category before.",
							color: "#ff5050",
						},
					],
				});

			// ? Generate embed configuration data
			configured.forEach((option) => {
				let text = "";

				// ? Add category, cooldown size and increments
				text = text.concat(
					`\`${option.name}\` **|** \`${option.size}\` **|** \`${option.increments}\` **|** `
				);

				// ? Add channels
				text = text.concat(
					`${option.channels.map((c: string) => {
						return `<#${c}>`;
					})}`
				);

				// ? Break a line after the category
				embed.description = embed.description.concat(text.concat("\n"));

				return void {};
			});

			embed = new MessageEmbed(embed);
			embed.setColor("#1df27d");

			message.channel.send({ embeds: [embed] });
		}
	},
};
