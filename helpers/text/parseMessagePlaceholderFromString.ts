import { Message } from "discord.js";
import * as database from "../../database";

export default async (message: Message, text: string) => {
	let content = text;

	// ? Guild placeholders
	if (message.guild) {
		const guild = await database.guilds.findOne({ _id: message.guildId });

		content = content
			.replace("{prefix}", guild.prefix)
			.replace("{guild_id}", `${message.guildId}`)
			.replace("{guild_name}", message.guild?.name);
	}

	// ? User placeholders
	if (message.author) {
		content = content
			.replace("{author}", `<@${message.author.id}>`)
			.replace("{author_id}", `${message.author.id}`)
			.replace("{author_username}", message.author.username)
			.replace("{author_avatar}", message.author.avatarURL.toString());
	}

	return content;
};
