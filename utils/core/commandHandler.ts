import { Client, Message } from "discord.js";
import commands from "../../commands";
import createNewGuild from "../../database/utils/createNewGuild";
import * as config from "./../../config.json";
import * as database from "./../../database";
import { consoleError } from "./logger";
import CommandNotFound from "./../../data/embeds/CommandNotFound";
import checkCooldown from "./../messages/checkCooldown";

export default async function commandHandler(bot: Client, message: Message) {
	if (message.author.bot) return;
	if (message.channel.type == "DM") return;
	if (!message.guild) return;
	let guild = await database.guilds.findOne({ _id: message.guildId });

	if (guild == null) guild = await createNewGuild(message.guild);

	if (!message.content.startsWith(guild.prefix)) return;

	message.channel.sendTyping().catch((e) => {
		consoleError(
			"commandHandler",
			"Can't sent typing status on ".concat(message.channel.id)
		);
	});

	const args = message.content
		.slice(guild.prefix.length, message.content.length)
		.split(" ");

	const requested_command = commands[args[0].toLowerCase()];

	if (!requested_command)
		return message.channel.send({
			embeds: [CommandNotFound],
		});

	try {
		args.shift(); // Remove command name from arguments
		if (
			!(await checkCooldown(
				guild,
				requested_command.category,
				message.channelId
			))
		)
			return;
		requested_command.run(bot, message, args);
	} catch (e) {
		message.channel.send("Something is wrong, I can't run this command.");
	}
}
