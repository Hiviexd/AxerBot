import { ChatInputCommandInteraction, Message, EmbedBuilder } from "discord.js";
import * as database from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";

export default {
	name: "disable",
	group: "set",
	help: {
		description: "disable the logging system",
		syntax: "/logging `set disabled`",
	},
	run: async (command: ChatInputCommandInteraction, args: string[]) => {
		if (!command.guild || !command.member) return;

		await command.deferReply();

		let guild = await database.guilds.findById(command.guildId);
		if (!guild) return;

		guild.logging.enabled = false;

		await database.guilds.findByIdAndUpdate(command.guildId, {
			$set: { logging: guild.logging },
		});

		return command.editReply({
			embeds: [generateSuccessEmbed("🔴 Logging system disabled!")],
		});
	},
};
