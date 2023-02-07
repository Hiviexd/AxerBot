import {
	ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
} from "discord.js";
import { ISlashCommandExecuteFunction } from "./SlashCommand";

export class SlashCommandSubcommand {
	private _executeFunction!: ISlashCommandExecuteFunction;
	public builder = new SlashCommandSubcommandBuilder();

	constructor(name: string, description: string) {
		this.builder.setName(name);
		this.builder.setDescription(description);
	}

	setExecuteFunction(fn: ISlashCommandExecuteFunction) {
		this._executeFunction = fn;

		return this;
	}

	run(interaction: ChatInputCommandInteraction) {
		this._executeFunction(interaction);
	}
}
