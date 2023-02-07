import {
	ChatInputCommandInteraction,
	SlashCommandSubcommandGroupBuilder,
} from "discord.js";
import { SlashCommandSubcommand } from "./SlashCommandSubCommand";

export class SlashCommandSubcommandGroup {
	private commands: SlashCommandSubcommand[] = [];
	public builder = new SlashCommandSubcommandGroupBuilder();

	constructor(name: string) {
		this.builder.setName(name);
	}

	addCommand(subcommand: SlashCommandSubcommand) {
		this.commands.push(subcommand);

		return this;
	}

	runCommand(
		interaction: ChatInputCommandInteraction,
		subcommand?: { name: string; group: string }
	) {
		const target = this.commands.find(
			(c) =>
				c.builder.name == subcommand?.name ||
				(interaction.commandName && subcommand?.group) ||
				interaction.options.getSubcommandGroup()
		);

		if (!target) return;

		target.run(interaction);
	}
}
