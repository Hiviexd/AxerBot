import { Client, Message } from "discord.js";
import commands from "../../commands";
import * as config from "./../../config.json";

export default function commandHandler(bot: Client, message: Message) {
	if (message.author.bot) return;
	if (message.channel.type == "DM") return;
	if (!message.content.startsWith(config.prefix)) return;
	if (message.content.length < 3) return;

	const args = message.content
		.slice(config.prefix.length, message.content.length)
		.split(" ");

	const requested_command = commands[args[0].toLowerCase()];

	if (!requested_command) return message.channel.send("Command not found");

	try {
		args.shift(); // Remove command name from arguments
		requested_command.run(bot, message, args);
	} catch (e) {
		message.channel.send("Something is wrong, i cant run this command.");
	}
}
