import { Client, CommandInteraction, Interaction } from "discord.js";
import commands from "../../commands";
import createNewGuild from "../../database/utils/createNewGuild";
import * as database from "../../database";
import checkCooldown from "../general/checkCooldown";
import createNewUser from "../../database/utils/createNewUser";

export default async function commandHandler(
	bot: Client,
	interaction: CommandInteraction
) {
	if (interaction.user.bot) return;
	if (interaction.channel?.type == "DM") return;
	if (!interaction.guild) return;
	let guild = await database.guilds.findOne({ _id: interaction.guildId });

	const user = await database.users.findById(interaction.user.id);

	if (guild == null) guild = await createNewGuild(interaction.guild);
	if (user == null) await createNewUser(interaction.user);

	const requested_command = commands[interaction.commandName];
	if (!requested_command) return interaction.reply("Command not found!");
	/*
		return interaction.channel.send({
			embeds: [CommandNotFound],
		});
		*/

	try {
		// if (
		// 	!(await checkCooldown(
		// 		guild,
		// 		requested_command.category,
		// 		interaction.channelId,
		// 		interaction
		// 	))
		// )
		// 	return;

		// * ================== Subcommands
		// if (requested_command.subcommands) {
		// 	let subcommand: any = {};

		// 	subcommand = requested_command.subcommands.filter(
		// 		(c: any) =>
		// 			c.trigger.toString() ==
		// 			args.slice(0, c.trigger.length).toString()
		// 	)[0];

		// 	if (subcommand) {
		// 		args.splice(0, subcommand.trigger.length);

		// 		return subcommand.run(interaction, args);
		// 	}
		// }

		requested_command.run(bot, interaction, []);
	} catch (e) {
		console.error(e);
		interaction
			.reply("Something is wrong, I can't run this command.")
			.catch((e) => {
				console.error(e);
			});
	}
}
