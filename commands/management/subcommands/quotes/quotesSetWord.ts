import { Message } from "discord.js";
import * as database from "../../../../database";

export const config = {
	name: "set word",
	description: "Sets a trigger word for the quotes system",
	syntax: "{prefix}quotes `set` `word` `<new word>`",
	trigger: ["set", "word"],
};

export async function run(message: Message, word: string) {
	if (!word) return message.channel.send(":x: Provide a valid trigger word.");

	let guild = await database.guilds.findById(message.guildId);

	if (!message.guild) return;

	guild.fun.enable = true;
	guild.fun.word = word.toUpperCase();

	await database.guilds.updateOne(
		{ _id: message.guildId },
		{
			fun: guild.fun,
		}
	);

	message.channel.send(`✅ Trigger word changed to \`${word}\``);
}
