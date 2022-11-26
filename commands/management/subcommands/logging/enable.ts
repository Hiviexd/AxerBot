import { CommandInteraction } from "discord.js";
import * as database from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";

export default {
	name: "enable",
	group: "set",
	help: {
		description: "Enable and set up a channel for the logging system",
		syntax: "/logging `set enable channel:#channel`",
	},
	run: async (command: CommandInteraction, args: string[]) => {
		if (!command.guild || !command.member) return;

		await command.deferReply();

		const channel = command.options.getChannel("channel", true);

		if (channel.type != "GUILD_TEXT")
			return command.editReply({
				embeds: [
					generateErrorEmbed(
						"You need to provide a **TEXT** channel."
					),
				],
			});

		let guild = await database.guilds.findById(command.guildId);
		if (!guild) return;

		guild.logging.enabled = true;
		guild.logging.channel = channel.id;

		await database.guilds.findByIdAndUpdate(command.guildId, {
			$set: { logging: guild.logging },
		});

		return command.editReply({
			embeds: [
				generateSuccessEmbed(
					`🟢 Logging system enabled and set to <#${channel.id}>!`
				),
			],
		});
	},
};
