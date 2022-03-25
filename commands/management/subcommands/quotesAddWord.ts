import { Message } from "discord.js";
import * as database from "../../../database";
import createNewGuild from "../../../database/utils/createNewGuild";

export const config = {
	name: "add",
	description: "Adds a new phrase to the server custom quotes list",
	syntax: "!quotes `add` `<phrase>`",
};

export async function run(message: Message) {
	let guild = await database.guilds.findById(message.guildId);

	const args = message.content.split(" ");
	args.splice(0, 2); // ? Clear the shit

	if (guild.quotes.mode != "custom")
		return message.channel.send(
			":x: Switch to custom list mode to add a new phrase."
		);

	// ? Prevent add blank spaces
	if (args.length < 1 || args.join(" ").trim() == "")
		return message.channel.send(
			":x: what am i supposed to add??? dumbass??"
		);

	if (!message.guild) return;

	guild.quotes.phrases.push(args.join(" "));

	await database.guilds.updateOne(
		{ _id: message.guildId },
		{
			quotes: guild.quotes,
		}
	);

	message.channel.send(`✅ Phrase added!`);
}
