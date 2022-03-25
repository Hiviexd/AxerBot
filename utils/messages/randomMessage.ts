import { parseTextFile } from "./processText";
import { Message } from "discord.js";
import * as database from "./../../database";
import createNewGuild from "./../../database/utils/createNewGuild";
import path from "path";

export default async function randomMessage(message: Message, bot: any) {
	if (!message.guild) return;

	let guild = await database.guilds.findById(message.guildId);
	if (guild.quotes.blacklist.channels.includes(message.channelId)) return;

	if (
		(guild.quotes.enable == true &&
			message.content
				.toUpperCase()
				.includes(guild.quotes.word.toUpperCase())) ||
		message.mentions.users.has(bot.user)
	) {
		if (guild.quotes.mode == "default") {
			const quotes = await parseTextFile(
				path.resolve(__dirname + "/../../data/axer.txt")
			);

			const quote = quotes[Math.floor(Math.random() * quotes.length)];

			message.channel.send(quote);
		} else {
			const quotes: string[] = guild.quotes.phrases;
			const quote = quotes[Math.floor(Math.random() * quotes.length)];

			if (!quote) return;

			message.channel.send(quote);
		}
	}
}
