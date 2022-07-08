import { CommandInteraction, CommandInteractionOption } from "discord.js";
import MissingPermissions from "../../../../responses/embeds/MissingPermissions";
import { guilds } from "../../../../database";
import { ownerId } from "../../../../config.json";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";

export default {
	name: "channel",
	group: "set",
	help: {
		description:
			"Sets the channel for the system (this will enable the system)",
		syntax: "{prefix}verification `channel` `#channel`",
		example: "{prefix}verification `channel` `#arrival`",
	},
	run: async (command: CommandInteraction, args: string[]) => {
		if (!command.member) return;

		if (typeof command.member?.permissions == "string") return;

		await command.deferReply();

		if (
			!command.member.permissions.has("MANAGE_GUILD", true) &&
			command.user.id !== ownerId
		)
			return command.editReply({ embeds: [MissingPermissions] });

		const channel = command.options.getChannel("text_channel", true);

		if (channel.type != "GUILD_TEXT")
			return command.editReply({
				embeds: [
					generateErrorEmbed(
						"❗ You need to provide a **TEXT** channel."
					),
				],
			});

		let guild = await guilds.findById(command.guildId);
		if (!guild)
			return command.editReply(
				"This guild isn't validated, try again after some seconds.."
			);

		guild.verification.enable = true;
		guild.verification.channel = channel.id;

		await guilds.findByIdAndUpdate(command.guildId, guild);

		command.editReply({
			embeds: [generateSuccessEmbed("✅ Set the verification channel.")],
		});
	},
};
