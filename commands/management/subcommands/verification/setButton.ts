import { CommandInteraction, CommandInteractionOption } from "discord.js";
import MissingPermissions from "../../../../responses/embeds/MissingPermissions";
import { guilds } from "../../../../database";
import { ownerId } from "../../../../config.json";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";

export default {
	name: "button",
    group: "set",
	help: {
        description: "Enable or disable the button to send the verification link.\nOnly reason to disable this is to only use the welcome message instead of the verification module",
		syntax: "/verification `set button` `status:enabled|disabled`",
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

		let guild = await guilds.findById(command.guildId);

		if (!guild)
			return command.editReply(
				"This guild isn't validated, try again after some seconds.."
			);
        
        const status = command.options.getString("status", true);

        status == "true" ? guild.verification.button = true : guild.verification.button = false;

        await guilds.findByIdAndUpdate(guild._id, guild);

        return command.editReply({
            embeds: [
                generateSuccessEmbed(
                    `The verification button has been ${status == "true" ? "enabled" : "disabled"}!`
                ),
            ],
        });
	},
};
