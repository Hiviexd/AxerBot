import { Client, Message, MessageEmbed, TextChannel } from "discord.js";
import * as database from "../../database";
import MissingPermissions from "../../data/embeds/MissingPermissions";
import { ownerId } from "../../config.json";

export default {
	name: "embeds",
	help: {
		description:
			"configure where and which embed will be allowed in X channels",
		syntax: "{prefix}embeds `<categories> <#channels>`",
		example:
			"{prefix}embeds `player,discussion,beatmap #osu #commands` \n{prefix}embeds `player,discussion,beatmap all` \n {prefix}embeds `player,discussion,beatmap none`",
		categories: ["`player`", "`comment`", "`beatmap`", "`discussion`"],
		extra: "You can use `all` or `none` to select all channels, or none",
	},
	category: "management",
	run: async (bot: Client, message: Message, args: string[]) => {
		const embedCategories = ["beatmap", "player", "discussion", "comment"];

		let guild = await database.guilds.findById(message.guildId);

		if (!message.guild || !message.member) return;

		if (
			!message.member.permissions.has("MANAGE_CHANNELS", true) &&
			message.author.id !== ownerId
		)
			return message.channel.send({ embeds: [MissingPermissions] });

		if (args.length < 2) return sendConfiguration();

		const categories: string[] = [];

		args[0].split(",").forEach((cat) => {
			if (embedCategories.includes(cat.toLowerCase()))
				categories.push(cat.toLowerCase());
		});

		if (categories.length < 1)
			return message.channel.send(
				`Invalid categories provided! Use \`${guild.prefix}help embeds\` to see how to use this command`
			);

		const channels = message.mentions.channels;

		if (
			channels.size < 1 &&
			!["all", "none"].includes(args[1].toLowerCase())
		)
			return message.channel.send(
				`Invalid channels provided! Use \`${guild.prefix}help embeds\` to see how to use this command`
			);

		categories.forEach((cat) => {
			if (args[1].toLowerCase() == "all") {
				guild.embeds[cat] = {
					all: true,
					none: false,
					channels: [],
				};
			} else if (args[1].toLowerCase() == "none") {
				guild.embeds[cat] = {
					all: false,
					none: true,
					channels: [],
				};
			} else {
				guild.embeds[cat] = {
					all: false,
					none: false,
					channels: channels.map((m) => m.id.toString()),
				};
			}
		});

		await database.guilds.findByIdAndUpdate(
			{ _id: message.guildId },
			guild
		);

		const res = new MessageEmbed()
			.setTitle("✅ Done!")
			.setDescription(
				`Configuration updated! Use ${guild.prefix}embeds to see the current configuration`
			)
			.setColor("#1df27d");

		message.channel.send({
			embeds: [res],
		});

		function sendConfiguration() {
			const embed = new MessageEmbed()
				.setTitle("⚙ Current embeds configuration")
				.setDescription(
					`Use \`${guild.prefix}help embeds\` to see the how to configure embeds`
				)
				.setColor("#1df27d");

			const staticEmbedCategories = Object.keys(guild.embeds);

			staticEmbedCategories.forEach((category) => {
				if (!embedCategories.includes(category)) return;

				if (guild.embeds[category].all) {
					embed.addField(category, `Allowed in All Channels`);
				} else if (guild.embeds[category].none) {
					embed.addField(category, `Disabled in All Channels`);
				} else {
					embed.addField(
						category,
						`${guild.embeds[category].channels
							.map((c: string) => `<#${c}>`)
							.join(", ")}`
					);
				}
			});

			message.reply({
				allowedMentions: {
					repliedUser: false,
				},
				embeds: [embed],
			});
		}
	},
};
