import { Client, Message, MessageEmbed } from "discord.js";
import commands from "../../commands";
import createNewGuild from "../../database/utils/createNewGuild";
import * as database from "../../database";
//import CommandNotFound from "../../data/embeds/CommandNotFound";
import checkCooldown from "../general/checkCooldown";
import createNewUser from "../../database/utils/createNewUser";

export default async function commandHandler(bot: Client, message: Message) {
	if (message.author.bot) return;
	if (message.channel.type == "DM") return;
	if (!message.guild) return;
	let guild = await database.guilds.findOne({ _id: message.guildId });

	const user = await database.users.findById(message.author.id);

	if (guild == null) guild = await createNewGuild(message.guild);
	if (user == null) await createNewUser(message.author);

	if (!guild || !user) return;

	if (!message.content.startsWith(guild.prefix)) return;

	const args = message.content
		.slice(guild.prefix.length, message.content.length)
		.split(" ");

	const requested_command = commands[args[0].toLowerCase()];

	if (!requested_command) return;

	const interactionEmbed = new MessageEmbed()
		.setTitle("Oh, i forgot to tell you")
		.setDescription(
			"This command is avaliable only with slash commands! I'm migrating all commands to slash commands. You can try it now, just type `/` and a popup will be shown."
		)
		.setColor("#ea6112");

	if (requested_command.interaction)
		return message.reply({
			embeds: [interactionEmbed],
			allowedMentions: {
				repliedUser: false,
			},
		});
	/*
		return message.channel.send({
			embeds: [CommandNotFound],
		});
		*/

	try {
		args.shift(); // Remove command name from arguments
		if (
			!(await checkCooldown(
				guild,
				requested_command.category,
				message.channelId,
				message
			))
		)
			return;

		// * ================== Subcommands
		if (requested_command.subcommands) {
			let subcommand: any = {};

			subcommand = requested_command.subcommands.filter(
				(c: any) =>
					c.trigger.toString() ==
					args.slice(0, c.trigger.length).toString()
			)[0];

			if (subcommand) {
				args.splice(0, subcommand.trigger.length);

				return subcommand.run(message, args);
			}
		}

		requested_command.run(bot, message, args);
	} catch (e) {
		console.error(e);
		message.channel
			.send("Something is wrong, I can't run this command.")
			.catch((e) => {
				console.error(e);
			});
	}
}
