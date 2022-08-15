import { CommandInteraction } from "discord.js";
import { tracks } from "../../../../database";
import crypto from "crypto";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import MissingPermissions from "../../../../responses/embeds/MissingPermissions";
import { ownerId } from "../../../../config.json";

export default {
	name: "tracker",
	group: "add",
	help: {
		description: "Add a tracking option",
	},
	run: async (command: CommandInteraction, args: string[]) => {
		await command.deferReply();

		if (!command.member || typeof command.member.permissions == "string")
			return;

		if (
			!command.member.permissions.has("MANAGE_CHANNELS", true) &&
			command.user.id !== ownerId
		)
			return command.editReply({ embeds: [MissingPermissions] });

		const channel = command.options.getChannel("channel", true);
		const modes = command.options.getString("modes", true).split(",");
		const status = command.options.getString("status", true).split(",");

		const actualTrack = await tracks.find({
			guild: command.guildId,
			channel: channel.id,
			type: "qat",
		});

		if (actualTrack.length != 0)
			return command.editReply({
				embeds: [
					generateErrorEmbed(
						"You can't add another tracker here. This channel already has a tracker."
					),
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

		const avaliableModes = ["osu", "taiko", "catch", "mania"];
		const clearModes: string[] = [];

		for (let mode of modes) {
			if (!avaliableModes.includes(mode)) {
				return command.editReply({
					embeds: [
						generateErrorEmbed(
							`The mode \`${mode}\` is not valid. Avaliable modes are: \`${avaliableModes.join(
								","
							)}\`
							Make sure that modes are separated by comma.`
						),
					],
				});
			}

			mode = mode.trim().toLowerCase();

			if (avaliableModes.includes(mode)) {
				clearModes.push(mode);
			}
		}

		const config = {
			modes: clearModes,
			open: status.includes("open"),
			closed: status.includes("closed"),
		};

		const id = crypto.randomBytes(30).toString("hex").slice(30);
		const newTrack = new tracks({
			_id: id,
			type: "qat",
			channel: channel.id,
			guild: command.guildId,
			targets: config,
		});

		await newTrack.save();

		command.editReply({
			embeds: [generateSuccessEmbed("Tracker added!")],
		});
	},
};
