import { Message } from "discord.js";
import MissingPermissions from "../../../../responses/embeds/MissingPermissions";
import { guilds } from "../../../../database";
import { ownerId } from "../../../../config.json";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";

export default {
	name: "verification channel",
	trigger: ["channel"],
	help: {
		description:
			"Sets the channel for the system (this will enable the system)",
		syntax: "{prefix}verification `channel` `#channel`",
		example: "{prefix}verification `channel` `#arrival`",
	},
	run: async (message: Message, args: string[]) => {
		if (!message.member) return;

		if (
			!message.member.permissions.has("MANAGE_GUILD", true) &&
			message.author.id !== ownerId
		)
			return message.channel.send({ embeds: [MissingPermissions] });

		const channel = message.mentions.channels.first();

		if (!channel || channel.type != "GUILD_TEXT")
			return message.channel.send({
				embeds: [generateErrorEmbed("❗ You need to mention a channel.")],
			});

		let guild = await guilds.findById(message.guildId);

		guild.verification.enable = true;
		guild.verification.channel = channel.id;

		await guilds.findByIdAndUpdate(message.guildId, guild);

		message.channel.send({
			embeds: [generateSuccessEmbed("✅ Set the verification channel.")],
		});
	},
};
