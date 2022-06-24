import { Client, Message, MessageEmbed } from "discord.js";
import sendCommandHelp from "../../helpers/core/sendCommandHelp";
import commands from "./../";
import CommandNotFound from "../../responses/embeds/CommandNotFound";
import * as database from "./../../database";

export default {
	name: "help",
	category: "misc",
	run: async (bot: Client, message: Message, args: string[]) => {
		if (args.length != 0) {
			const requested_command = commands[args[0].toLowerCase()];

			if (!requested_command)
				return message.channel.send({
					embeds: [CommandNotFound],
				});

			try {
				// * ================== Subcommands
				if (requested_command.subcommands) {
					let subcommand: any = {};
					args.shift();

					subcommand = requested_command.subcommands.filter(
						(c: any) =>
							c.trigger.toString() ==
							args.slice(0, c.trigger.length).toString()
					)[0];

					if (subcommand) {
						args.splice(0, subcommand.trigger.length);

						return sendCommandHelp(subcommand, message);
					}
				}

				sendCommandHelp(requested_command, message);
			} catch (e) {
				console.error(e);
			}
		} else {
			const categories: string[] = [];
			const fields: any = [];
			const commands_array: any = [];
			const guild = await database.guilds.findOne({
				_id: message.guildId,
			});

			// ? Transform Object object to Array object
			Object.keys(commands).forEach((command: any) => {
				commands_array.push(commands[command]);
				return;
			});

			commands_array.forEach((command: any) => {
				if (!categories.includes(command.category))
					return categories.push(command.category);

				return;
			});

			// ? Parse category commands
			categories.forEach((category) => {
				console.log(category);
				fields.push({
					name: category,
					value: getCategoryCommands(category),
				});
			});

			function getCategoryCommands(category: string) {
				const c: string[] = [];

				commands_array.forEach((command: any) => {
					if (command.category == category)
						return c.push(`\`${command.name}\``);
				});

				return c.join(", ");
			}

			const embed = new MessageEmbed({
				title: "List of avaliable commands",
				description: `Use \`${guild.prefix}help <command>\` to see how a specific command works.`,
				color: "#f45592",
				fields: fields,
			});

			message.reply({
				embeds: [embed],
				allowedMentions: {
					repliedUser: false,
				},
			});
		}
	},
};
