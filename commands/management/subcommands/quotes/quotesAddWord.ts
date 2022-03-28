import { Message } from "discord.js";
import * as database from "../../../../database";

export const config = {
	name: "add",
	description: "Adds a new phrase to the server custom quotes list",
	syntax: "{prefix}quotes `add` `<phrase>`",
	trigger: ["add"],
};

export async function run(message: Message, args: string[]) {
	let guild = await database.guilds.findById(message.guildId);

	if (guild.fun.mode != "custom")
		return message.channel.send(
			":x: Switch to custom list mode to add a new phrase."
		);

	// ? Prevent add blank spaces
	if (args.length < 1 || args.join(" ").trim() == "")
		return message.channel.send(
			":x: what am i supposed to add??? dumbass??"
		);

	if (!message.guild) return;

	guild.fun.phrases.push(args.join(" "));

	await database.guilds.updateOne(
		{ _id: message.guildId },
		{
			fun: guild.fun,
		}
	);

	message.channel.send(`✅ Phrase added!`);
}
