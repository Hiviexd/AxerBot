import {
	Client,
	CommandInteraction,
	CommandInteractionOptionResolver,
	Interaction,
} from "discord.js";
import { commands } from "../../commands";
import createNewGuild from "../../database/utils/createNewGuild";
import * as database from "../../database";
import checkCooldown from "../general/checkCooldown";
import createNewUser from "../../database/utils/createNewUser";
import { ownerId } from "./../../config.json";
import generateMissingPermsEmbed from "../text/embeds/generateMissingPermsEmbed";

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

	if (requested_command) {
		function checkPermissions() {
			if (!requested_command.permissions) return true;

			if (!interaction.member) return false;
			if (typeof interaction.member.permissions == "string") return false;

			if (interaction.user.id == ownerId) return true;

			return interaction.member.permissions.has(
				requested_command.permissions,
				true
			);
		}

		if (!checkPermissions()) {
			return interaction.reply({
				embeds: [
					generateMissingPermsEmbed(requested_command.permissions),
				],
			});
		}

		try {
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
}
