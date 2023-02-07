import {
	ChatInputCommandInteraction,
	PermissionFlags,
	SlashCommandBuilder,
} from "discord.js";
import { SlashCommandSubcommand } from "./SlashCommandSubCommand";
import { SlashCommandSubcommandGroup } from "./SlashCommandSubcommandGroup";

export type ISlashCommandExecuteFunction = (
	interaction: ChatInputCommandInteraction
) => any;

export type PartialSubcommandExecutionParam = {
	name: string;
	group?: string | null | undefined;
};

export class SlashCommand {
	private _executeFunction: ISlashCommandExecuteFunction;
	private _subcommand_groups: SlashCommandSubcommandGroup[] = [];
	private _subcommands: SlashCommandSubcommand[] = [];
	public names: string[] = [];
	public builder = new SlashCommandBuilder();

	constructor(name: string[], description: string) {
		this.builder.setName(name[0]);
		this.builder.setDescription(description);
		this.names = name;
	}

	/**
	 * You need to add commands to the group first!
	 * This will be automated run by the handler.
	 */
	addSubcommandGroup(group: SlashCommandSubcommandGroup) {
		this._subcommand_groups.push(group);
		return this;
	}

	addSubcommand(subcommand: SlashCommandSubcommand) {
		this._subcommands.push(subcommand);
		return this;
	}

	setExecuteFunction(fn: ISlashCommandExecuteFunction) {
		this._executeFunction = fn;
	}

	runSubcommand(
		interaction: ChatInputCommandInteraction,
		subcommand?: PartialSubcommandExecutionParam
	) {
		if (subcommand && subcommand.group)
			return this.executeSubcommandWithGroup(interaction, subcommand);

		const target = this._subcommands.find(
			(c) =>
				c.builder.name == subcommand?.name ??
				interaction.options.getSubcommand()
		);

		if (!target) return;

		target.run(interaction);
	}

	private executeSubcommandWithGroup(
		interaction: ChatInputCommandInteraction,
		subcommand: PartialSubcommandExecutionParam
	) {
		if (!subcommand.group)
			return new Error(
				`Invalid subcommand group provided! Need to specify group name to run command ${JSON.stringify(
					subcommand
				)}`
			);

		const targetGroup = this._subcommand_groups.find(
			(g) => g.builder.name == subcommand.group
		);

		if (!targetGroup)
			return new Error(
				`You didn't append this group to this command! ${JSON.stringify(
					subcommand
				)}`
			);

		targetGroup.runCommand(interaction);
	}

	run(interaction: ChatInputCommandInteraction) {
		this._executeFunction(interaction);
	}
}
