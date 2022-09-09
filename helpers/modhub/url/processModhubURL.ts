import { Message } from "discord.js";
import { guilds } from "../../../database";
import RequestEmbed from "../../../responses/modhub/RequestEmbed";

export default async (url: URL, type: string, message: Message) => {
	const guild = await guilds.findById(message.guildId);

	if (!guild) return;

	if (type == "request" && checkEmbed("modhub", message))
		RequestEmbed(url, message);

	function checkEmbed(category: string, message: Message) {
		if (!guild) return true;

		if (message.member?.permissions.has("MANAGE_MESSAGES", true))
			return true;

		if (guild.embeds[category].channels.includes(message.channelId))
			return true;

		if (guild.embeds[category].all && !guild.embeds[category].none)
			return true;

		return false;
	}
};
