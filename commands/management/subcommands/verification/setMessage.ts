import { Message } from "discord.js";
import MissingPermissions from "../../../../data/embeds/MissingPermissions";
import { guilds } from "../../../../database";
import { ownerId } from "../../../../config.json";

export default {
	name: "verification message",
	trigger: ["message"],
	help: {
		description: "Set the message that will be sent on the system channel",
		syntax: "{prefix}verification `message` `Welcome to the server!`",
	},
	run: async (message: Message, args: string[]) => {
		if (!message.member) return;

		if (
			!message.member.permissions.has("MANAGE_GUILD", true) &&
			message.author.id !== ownerId
		)
			return message.channel.send({ embeds: [MissingPermissions] });

		const new_message = args.join();

		if (new_message.trim() == "")
			return message.reply(":x: Provide a valid message!");

		let guild = await guilds.findById(message.guildId);

		guild.verification.message = message;

		await guilds.findByIdAndUpdate(message.guildId, guild);

		message.channel.send(`✅ Done! Message updated.`);
	},
};
