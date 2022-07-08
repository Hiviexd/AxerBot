import {
	Client,
	CommandInteraction,
	CommandInteractionOptionResolver,
	Interaction,
} from "discord.js";
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

	if (requested_command)
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

			let subcommand_group = "";

			try {
				subcommand_group = interaction.options.getSubcommandGroup();
			} catch (e) {
				void {};
			}

			if (subcommand_group) {
				const subcommand = interaction.options.getSubcommand(true);

				const requested_subcommand = requested_command.subcommands.find(
					(c: any) =>
						c.group == subcommand_group && c.name == subcommand
				);

				if (requested_subcommand)
					return requested_subcommand.run(interaction, []);
			}
			// const subcommands = interaction.options.data.filter(
			// 	(o) => o.type == "SUB_COMMAND_GROUP"
			// );

			// const subcommand_group = subcommands[0];

			// if (subcommand_group && subcommand_group.options) {
			// 	const first_option: any = subcommand_group.options[0];

			// 	if (subcommand_group.options) {
			// 		const requested_subcommand =
			// 			requested_command.subcommands.find(
			// 				(c: any) =>
			// 					c.group == subcommand_group.name &&
			// 					c.name == first_option.name
			// 			);

			// 		if (requested_subcommand) {
			// 			const subcommand_group_object =
			// 				interaction.options.getSubcommand(true);

			// 			console.log(subcommand_group_object);

			// 			const subcommand_object =
			// 				subcommand_group_object.options.getSubCommand(
			// 					first_option.name
			// 				);

			// 			interaction.options = subcommand_object.options;

			// 			return requested_subcommand.run(interaction, []);
			// 		}
			//}
			//}

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
