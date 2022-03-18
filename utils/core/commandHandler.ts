import { Client, CommandInteraction, Message } from "discord.js";
import commands from "../../commands";
import createNewGuild from "../../database/utils/createNewGuild";
import * as config from "./../../config.json";
import * as database from "./../../database";
import { consoleCheck, consoleError, consoleLog } from "./logger";
import CommandNotFound from "./../../data/embeds/CommandNotFound";
import registerCommands from "../commands/registerCommands";

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
		requested_command.run(bot, message, args);
	} catch (e) {
		message.channel.send("Something is wrong, I can't run this command.");
	}
}

export async function interactionHandler(
	interaction: CommandInteraction,
	bot: Client
) {
	if (interaction.user.bot) return;
	if (!interaction.channel) return;
	if (interaction.channel.type == "DM") return;

	const requested_command =
		commands[interaction.commandName.toLocaleLowerCase()];

	requested_command.run(bot, interaction, []);
}

export async function startCommands(bot: Client) {
	const current_commands = bot.application?.commands.cache;

	Object.keys(commands).forEach(async (command) => {
		let c = commands[command];

		if (c.slash != undefined) {
			const _commands: any[] = [];
			c = c.slash;

			if (!current_commands?.find((cmd) => cmd.name == c.name)) {
				consoleLog(
					"commandHandler",
					`Command ${c.name} not found. Creating command...`
				);
				await bot.application?.commands.create(c);

				_commands.push(c);

				consoleCheck("commandHandler", `Command ${c.name} created!`);
			} else {
				consoleLog(
					"commandHandler",
					`Command ${c.name} found! Updating command...`
				);

				await bot.application?.commands.cache
					.find((cmd) => cmd.name == c.name)
					?.edit(c);

				_commands.push(c);

				consoleCheck("commandHandler", `Command ${c.name} updated!`);
			}

			// registerCommands(_commands);
		}
	});
}
