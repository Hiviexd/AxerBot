import { CommandInteraction } from "discord.js";
import { tracks } from "../../../../database";
import crypto from "crypto";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import MissingPermissions from "../../../../responses/embeds/MissingPermissions";
import { ownerId } from "../../../../config.json";

export default {
	name: "tracker",
	group: "remove",
	help: {
		description: "Remove a tracker for a channel",
	},
	run: async (command: CommandInteraction, args: string[]) => {
		await command.deferReply();

		if (!command.member || typeof command.member.permissions == "string")
			return;

		const channel = command.options.getChannel("channel", true);

		const actualTrack = await tracks.find({
			guild: command.guildId,
			channel: channel.id,
			type: "qat",
		});

		if (actualTrack.length == 0)
			return command.editReply({
				embeds: [
					generateErrorEmbed("This channel doesn't have a tracker."),
				],
			});

		if (channel.type != "GUILD_TEXT")
			return command.editReply({
				embeds: [
					generateErrorEmbed(
						"You need to provide a valid text channel."
					),
				],
			});

		await tracks.deleteMany({
			guild: command.guildId,
			channel: channel.id,
			type: "qat",
		});

		command.editReply({
			embeds: [generateSuccessEmbed("Tracker removed!")],
		});
	},
};
