import { Client, CommandInteraction, MessageEmbed } from "discord.js";
import * as database from "./../../database";
import enable from "./subcommands/logging/enable";
import disable from "./subcommands/logging/disable";

export default {
	name: "logging",
	help: {
		description: "Configure the logging system",
		syntax: "{prefix}logging `<action>` `<value>`",
		example:
			"{prefix}logging `channel` `wasteland`\n{prefix}logging `disable`",
		options: ["`set enable`", "`set disable`"],
	},
	category: "management",
	permissions: ["MANAGE_CHANNELS"],
	subcommands: [enable, disable],
	interaction: true,
	config: {
		type: 1,
		options: [
			{
				name: "status",
				type: 1,
				description: "Check current system configuration",
			},
			{
				name: "set",
				type: 2,
				description: "Configure the logging system",
				max_value: 1,
				options: [
					{
						name: "enable",
						type: 1,
						description: "Enable the logging system",
						options: [
							{
								name: "channel",
								type: 7,
								description: "The channel to log to",
								required: true,
							},
						],
					},
					{
						name: "disable",
						type: 1,
						description: "Disable the logging system",
					},
				],
			},
		],
	},
	run: async (bot: Client, command: CommandInteraction, args: string[]) => {
		await command.deferReply();

		if (!command.member || typeof command.member.permissions == "string")
			return;

		let guild = await database.guilds.findById(command.guildId);
		if (!guild) return;

		const embed = new MessageEmbed()
			.setTitle("⚙️ Logging Configuration")
			.setColor(guild.logging.enabled ? "#1df27d" : "#e5243b")
			.addField(
				"Status",
				guild.logging.enabled ? "🟢 Enabled" : "🔴 Disabled",
				false
			)
			.addField(
				"Channel",
				guild.logging.channel
					? `<#${guild.logging.channel}>`
					: "Not set",
				false
			);

		command.editReply({ embeds: [embed] });
	},
};
