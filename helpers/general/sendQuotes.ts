import { parseTextFile } from "../text/processText";
import { Client } from "discord.js";
import { Message } from "discord.js";
import * as database from "../../database";
import { Chance } from "chance";
import path from "path";

export default async (message: Message, bot: Client) => {
	if (!message.guild) return;

	let guild = await database.guilds.findById(message.guildId);
	if (guild.fun.blacklist.channels.includes(message.channelId)) return;

	const chance = new Chance();

	if (!guild || guild == null) return;

	if (
		(guild.fun.enable == true &&
			message.content
				.toUpperCase()
				.includes(guild.fun.word.toUpperCase())) ||
		message.mentions.users.filter((u) => u.id == bot.application?.id).size >
			0
	) {
		if (!guild.fun.chance) guild.fun.chance = 100; // ? fallback chance to 100 if its undefined

		if (guild.fun.mode == "default") {
			const quotes = await parseTextFile(
				path.resolve(__dirname + "/../../data/axer.txt")
			);

			const quote = quotes[Math.floor(Math.random() * quotes.length)];

			if (!chance.bool({ likelihood: guild.fun.chance })) return;

			message.channel.send(quote);
		} else {
			const quotes: string[] = guild.fun.phrases;
			const quote = quotes[Math.floor(Math.random() * quotes.length)];

			if (!quote) return;

			if (!chance.bool({ likelihood: guild.fun.chance })) return;
			message.channel.send(quote);
		}
	}
};
