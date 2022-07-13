import { Client, Channel, MessageEmbed, CommandInteraction } from "discord.js";
import * as database from "../../database";
import MissingPermissions from "../../responses/embeds/MissingPermissions";
import { ownerId } from "../../config.json";
import generateSuccessEmbed from "../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";

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
	interaction: true,
	config: {
		type: 1,
		options: [
			{
				name: "embed",
				type: 3,
				description: "Data to sync",
				max_value: 1,
				required: true,
				choices: [
					{
						name: "player/mapper",
						value: "player",
					},
					{
						name: "comment",
						value: "comment",
					},
					{
						name: "beatmap",
						value: "beatmap",
					},
					{
						name: "modding",
						value: "discussion",
					},
				],
			},
			{
				name: "channels",
				type: 3,
				description:
					'You can mention channels or type "all" for all channels or "none" for block.',
				required: true,
			},
		],
	},
	category: "management",
	run: async (bot: Client, command: CommandInteraction, args: string[]) => {
		await command.deferReply();
		if (!command.guild) return;

		const channel = command.options.getString("channels", true);

		const channelIds = channel
			.replace(/ /g, ",")
			.replace(/<#/g, "")
			.replace(/>/g, "")
			.split(",");

		const mentionedChannels: Channel[] = [];

		if (!["all", "none"].includes(channel)) {
			for (const _id of channelIds) {
				try {
					const req = await command.guild.channels.fetch(_id);

					if (req && req.isText()) {
						if (req.guildId == command.guildId) {
							mentionedChannels.push(req);
						}
					}
				} catch (e) {
					console.error(e);
				}
			}

			if (mentionedChannels.length < 1)
				return command.editReply({
					embeds: [
						generateErrorEmbed(
							":x: You need to mention valid **TEXT CHANNELS**"
						),
					],
				});
		}

		const targetOption = channel;

		if (mentionedChannels.length < 1) {
			if (!["all", "none"].includes(targetOption))
				return command.editReply({
					embeds: [
						generateErrorEmbed(
							":x: Invalid channels/options provided.You can mention channels or use `none` option to disable this category in all channels or `all` to enable inall channels."
						),
					],
				});
		}

		const category = command.options.getString("embed", true);

		const guild = await database.guilds.findById(command.guildId);

		if (!guild)
			return command.editReply({
				embeds: [
					generateErrorEmbed(
						"This guild isn't validated! Please, wait some seconds and try again."
					),
				],
			});

		if (targetOption == "all") {
			guild.embeds[category] = {
				all: true,
				none: false,
				channels: [],
			};
		}

		if (targetOption == "none") {
			guild.embeds[category] = {
				all: false,
				none: true,
				channels: [],
			};
		}

		if (!["all", "none"].includes(targetOption)) {
			guild.embeds[category] = {
				all: false,
				none: false,
				channels: mentionedChannels.map((c) => c.id),
			};
		}

		const texts: { [key: string]: string } = {
			all: "Done! This category is enabled in all channels.",
			none: `Done! This category is disabled for all channels.`,
			channel: `:white_check_mark: Done! This category is enabled in ${mentionedChannels.join(
				", "
			)}`,
		};

		return await command.editReply({
			embeds: [
				generateSuccessEmbed(
					["all", "none"].includes(channel)
						? texts[channel]
						: texts["channel"]
				),
			],
		});

		// const embedCategories = ["beatmap", "player", "discussion", "comment"];
		// let guild = await database.guilds.findById(message.guildId);
		// if (!guild) return;
		// if (!message.guild || !message.member) return;
		// if (
		// 	!message.member.permissions.has("MANAGE_CHANNELS", true) &&
		// 	message.author.id !== ownerId
		// )
		// 	return message.channel.send({ embeds: [MissingPermissions] });
		// if (args.length < 2) return sendConfiguration();
		// const categories: string[] = [];
		// args[0].split(",").forEach((cat) => {
		// 	if (embedCategories.includes(cat.toLowerCase()))
		// 		categories.push(cat.toLowerCase());
		// });
		// if (categories.length < 1)
		// 	return message.channel.send({
		// 		embeds: [
		// 			generateErrorEmbed(
		// 				`❗ Invalid categories provided! Use \`${guild.prefix}help embeds\` to see how to use this command`
		// 			),
		// 		],
		// 	});
		// const channels = message.mentions.channels;
		// if (
		// 	channels.size < 1 &&
		// 	!["all", "none"].includes(args[1].toLowerCase())
		// )
		// 	return message.channel.send({
		// 		embeds: [
		// 			generateErrorEmbed(
		// 				`❗ Invalid channels provided! Use \`${guild.prefix}help embeds\` to see how to use this command`
		// 			),
		// 		],
		// 	});
		// categories.forEach((cat) => {
		// 	if (!guild) return;
		// 	if (args[1].toLowerCase() == "all") {
		// 		guild.embeds[cat] = {
		// 			all: true,
		// 			none: false,
		// 			channels: [],
		// 		};
		// 	} else if (args[1].toLowerCase() == "none") {
		// 		guild.embeds[cat] = {
		// 			all: false,
		// 			none: true,
		// 			channels: [],
		// 		};
		// 	} else {
		// 		guild.embeds[cat] = {
		// 			all: false,
		// 			none: false,
		// 			channels: channels.map((m) => m.id.toString()),
		// 		};
		// 	}
		// });
		// await database.guilds.findByIdAndUpdate(
		// 	{ _id: message.guildId },
		// 	guild
		// );
		// message.channel.send({
		// 	embeds: [
		// 		generateSuccessEmbed(
		// 			`✅ Configuration updated! Use \`${guild.prefix}embeds\` to see the current configuration`
		// 		),
		// 	],
		// });
		// function sendConfiguration() {
		// 	if (!guild) return;
		// 	const embed = new MessageEmbed()
		// 		.setTitle("⚙ Current embeds configuration")
		// 		.setDescription(
		// 			`Use \`${guild.prefix}help embeds\` to see the how to configure embeds`
		// 		)
		// 		.setColor("#1df27d");
		// 	const staticEmbedCategories = Object.keys(guild.embeds);
		// 	staticEmbedCategories.forEach((category) => {
		// 		if (!guild) return;
		// 		if (!embedCategories.includes(category)) return;
		// 		if (guild.embeds[category].all) {
		// 			embed.addField(category, `Allowed in All Channels`);
		// 		} else if (guild.embeds[category].none) {
		// 			embed.addField(category, `Disabled in All Channels`);
		// 		} else {
		// 			embed.addField(
		// 				category,
		// 				`${guild.embeds[category].channels
		// 					.map((c: string) => `<#${c}>`)
		// 					.join(", ")}`
		// 			);
		// 		}
		// 	});
		// 	message.reply({
		// 		allowedMentions: {
		// 			repliedUser: false,
		// 		},
		// 		embeds: [embed],
		// 	});
		// }
	},
};
