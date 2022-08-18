import { Client, Message, MessageEmbed } from "discord.js";
import * as database from "./../../database";
import generateSuccessEmbed from "./../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";

export default {
	name: "logging",
	help: {
		description: "Configure the logging system",
		syntax: "{prefix}logging `<action>` `<value>`",
		example:
			"{prefix}logging `channel` `wasteland`\n{prefix}logging `disable`",
		options: ["`channel`", "`disable`"],
	},
	category: "management",
    permissions: ["MANAGE_CHANNELS"],
	run: async (bot: Client, message: Message, args: string[]) => {
		const actions = ["disable", "channel"];

		if (!message.guild) return;

		const guild = await database.guilds.findOne({ _id: message.guildId });
		if (!guild) return;

		if (args.length == 0) return sendCurrentConfiguration();

		if (args.length == 2) {
			const params = {
				action: args[0],
				value: args[1],
			};

			if (!actions.includes(params.action))
				return message.channel.send({
					embeds: [
						generateErrorEmbed(
							`❗ Invalid action value. Provide a valid action.`
						),
					],
				});

			if (params.action == "channel") {
				if (params.value == "") {
					return message.channel.send({
						embeds: [
							generateErrorEmbed(
								`❗ Invalid channel value. Provide a valid channel.`
							),
						],
					});
				}
				const channel = message.guild?.channels.cache.find(
					(channel) =>
						channel.name.toLowerCase() == params.value &&
						channel.type == "GUILD_TEXT"
				);

				if (!channel)
					return message.channel.send({
						embeds: [
							generateErrorEmbed(
								`❗ No channel found with name ${params.value.toLowerCase()}.`
							),
						],
					});

				guild.logging.channel = channel.id;
				guild.logging.enabled = true;

				await database.guilds.updateOne(
					{ _id: message.guildId },
					{ logging: guild.logging }
				);

				return message.channel.send({
					embeds: [
						generateSuccessEmbed(
							`✅ Logging channel set to <#${guild.logging.channel}>`
						),
					],
				});
			}
		}

		if (args.length == 1) {
			const params = {
				action: args[0],
			};

			if (!actions.includes(params.action))
				return message.channel.send({
					embeds: [
						generateErrorEmbed(
							`❗ Invalid action value. Provide a valid action.`
						),
					],
				});

			if (params.action == "disable") {
				guild.logging.enabled = false;

				await database.guilds.updateOne(
					{ _id: message.guildId },
					{ $set: { logging: guild.logging } }
				);

				return message.channel.send({
					embeds: [generateSuccessEmbed(`✅ Logging disabled.`)],
				});
			}
		}
		function sendCurrentConfiguration() {
			if (!guild) return;

			let ch: string = "";
			if (guild.logging.channel == "") ch = "None";
			else ch = `<#${guild.logging.channel}>`;
			const embed = new MessageEmbed()
				.setTitle("Logging Configuration")
				.setColor(guild.logging.enabled ? "#1df27d" : "#e5243b")
				.setDescription(
					`**Status:** ${
						guild.logging.enabled ? "Enabled" : "Disabled"
					}
                    **Channel:** ${ch}`
				);

			message.channel.send({ embeds: [embed] });
		}
	},
};
