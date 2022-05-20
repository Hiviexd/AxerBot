import { Message } from "discord.js";
import MissingPermissions from "../../../../data/embeds/MissingPermissions";
import { guilds } from "../../../../database";
import { ownerId } from "../../../../config.json";

export default {
	name: "verification channel",
	trigger: ["channel"],
	help: {
		description:
			"Sets the channel for the system (this will enable the system)",
		syntax: "{prefix}verification `channel` `#arrival`",
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
			return message.reply(":x: Mention a valid text channel!");

		let guild = await guilds.findById(message.guildId);

		guild.verification.enable = true;
		guild.verification.channel = channel.id;

		await guilds.findByIdAndUpdate(message.guildId, guild);

		message.channel.send(
			`✅ Done! Channel updated (The system is enabled now. You can use \`${guild.prefix}verification disable\` to disable).`
		);
	},
};
