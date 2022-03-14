import { parseTextFile } from "./processText";
import { Message } from "discord.js";
import * as database from "./../../database";
import createNewGuild from "./../../database/utils/createNewGuild";
import path from "path";

export default async function randomMessage(message: Message, bot: any) {
	if (!message.guild) return;

	let guild = await database.guilds.findById(message.guildId);

	if (guild == null) guild = await createNewGuild(message.guild);

	if (
		(guild.fun.enable == true &&
			message.content.toUpperCase().includes(guild.fun.word)) ||
		message.mentions.users.has(bot.user)
	) {
		if (guild.fun.mode == "default") {
			const quotes = await parseTextFile(
				path.resolve(__dirname + "/../../data/axer.txt")
			);

			const quote = quotes[Math.floor(Math.random() * quotes.length)];

			message.channel.send(quote);
		} else {
			const quotes: string[] = guild.fun.phrases;
			const quote = quotes[Math.floor(Math.random() * quotes.length)];

			message.channel.send(quote);
		}
	}
}
