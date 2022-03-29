import { Message } from "discord.js";
import * as database from "../../database";

export default (message: Message, guild: any) => {
	let content = message.content;

	// ? Guild placeholders
	if (message.guild) {
		content = content
			.replace(/{prefix}/gi, `${guild.prefix}`)
			.replace(/{guild_id}/gi, `${message.guildId}`)
			.replace(
				/{guild_name}/gi,
				message.guild?.name ? message.guild?.name : "this guild"
			);
	}

	// ? User placeholders
	if (message.author) {
		content = content
			.replace(/{author}/gi, `<@${message.author.id}>`)
			.replace(/{author_id}/gi, `${message.author.id}`)
			.replace(/{author_username}/gi, message.author.username)
			.replace(/{author_avatar}/gi, message.author.avatarURL.toString());
	}

	return content;
};
