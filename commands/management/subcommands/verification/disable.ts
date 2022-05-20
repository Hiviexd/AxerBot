import { Message } from "discord.js";
import MissingPermissions from "../../../../data/embeds/MissingPermissions";
import { guilds } from "../../../../database";
import { ownerId } from "../../../../config.json";

export default {
	name: "verification disable",
	trigger: ["disable"],
	help: {
		description: "Yep, you guessed it",
		syntax: "{prefix}verification `disable`",
	},
	run: async (message: Message, args: string[]) => {
		if (!message.member) return;

		if (
			!message.member.permissions.has("MANAGE_GUILD", true) &&
			message.author.id !== ownerId
		)
			return message.channel.send({ embeds: [MissingPermissions] });

		let guild = await guilds.findById(message.guildId);

		guild.verification.enable = false;

		await guilds.findByIdAndUpdate(message.guildId, guild);

		message.channel.send(`✅ Done! System disabled.`);
	},
};
