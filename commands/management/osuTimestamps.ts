import { Client, ChatInputCommandInteraction } from "discord.js";
import * as database from "../../database";
import generateSuccessEmbed from "../../helpers/text/embeds/generateSuccessEmbed";

export default {
	name: "osutimestamps",
	category: "management",
	help: {
		description:
			"Enable or disable the detection of osu! timestamps in messages",
		syntax: "/osuTimestamps status:`<enable/disable>`",
	},
	interaction: true,
	config: {
		type: 1,
		options: [
			{
				name: "status",
				type: 3,
				description:
					"Enable or disable the detection of osu! timestamps in messages",
				max_value: 1,
				required: true,
				choices: [
					{
						name: "enable",
						value: "true",
					},
					{
						name: "disable",
						value: "false",
					},
				],
			},
		],
	},
	permissions: ["MANAGE_CHANNELS"],
	run: async (
		bot: Client,
		command: ChatInputCommandInteraction,
		args: string[]
	) => {
		await command.deferReply();
		if (!command.guild || !command.member) return;
		if (typeof command.member?.permissions == "string") return;

		const guild = await database.guilds.findOne({ _id: command.guildId });
		if (!guild) return;

		const status = command.options.get("status")
			? command.options.get("status")?.value == "true"
			: true;

		guild.osuTimestamps = status;

		await database.guilds.updateOne(
			{ _id: command.guildId },
			{ $set: { osuTimestamps: status } }
		);

		return command.editReply({
			embeds: [
				generateSuccessEmbed(
					`${
						status ? "Enabled" : "Disabled"
					} osu! timestamp detection in messages!`
				),
			],
		});
	},
};
