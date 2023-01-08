import { Client } from "discord.js";

export default async function presence(
	bot: Client,
	bot_user: any,
	ready: boolean
) {
	ready
		? bot_user.setPresence({
				status: "online",
				activities: [
					{
						name: `${bot.guilds.cache.size} servers | /help`,
						type: "WATCHING",
					},
				],
		  })
		: bot_user.setPresence({
				status: "dnd",
				activities: [{ name: `Booting up...`, type: "PLAYING" }],
		  });
}
