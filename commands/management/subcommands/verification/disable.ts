import {
	ChatInputCommandInteraction,
	ChatInputCommandInteractionOption,
} from "discord.js";
import MissingPermissions from "../../../../responses/embeds/MissingPermissions";
import { guilds } from "../../../../database";
import { ownerId } from "../../../../config.json";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";

export default {
	name: "disabled",
	group: "set",
	help: {
		description: "Disable the system manually",
		syntax: "/verification `set disabled`",
	},
	run: async (command: ChatInputCommandInteraction, args: string[]) => {
		if (!command.member) return;

		if (typeof command.member?.permissions == "string") return;

		await command.deferReply();

		if (
			!command.member.permissions.has("MANAGE_GUILD", true) &&
			command.user.id !== ownerId
		)
			return command.editReply({ embeds: [MissingPermissions] });

		let guild = await guilds.findById(command.guildId);
		if (!guild)
			return command.editReply(
				"This guild isn't validated, try again after some seconds.."
			);

		guild.verification.enable = false;

		await guilds.findByIdAndUpdate(command.guildId, guild);

		command.editReply({
			embeds: [generateSuccessEmbed("✅ System disabled!")],
		});
	},
};
