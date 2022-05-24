import { Message } from "discord.js";
import MissingPermissions from "../../../../responses/embeds/MissingPermissions";
import { guilds } from "../../../../database";
import { ownerId } from "../../../../config.json";

export default {
	name: "verification enable",
	trigger: ["enable"],
	help: {
		description:
			"You need to set the system channel before enabling the system",
		syntax: "{prefix}verification `enable`",
	},
	run: async (message: Message, args: string[]) => {
		if (!message.member) return;

		if (
			!message.member.permissions.has("MANAGE_GUILD", true) &&
			message.author.id !== ownerId
		)
			return message.channel.send({ embeds: [MissingPermissions] });

		let guild = await guilds.findById(message.guildId);

		if (guild.verification == "")
			return message.channel.send(
				`:x: You need to set the system channel before enable this!`
			);

		guild.verification.enable = true;

		await guilds.findByIdAndUpdate(message.guildId, guild);

		message.channel.send(`✅ Done! System enabled.`);
	},
};
