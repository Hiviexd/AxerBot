import { SlashCommandSubcommandGroupBuilder } from "discord.js";
import { SlashCommandSubcommand } from "./SlashCommandSubcommand";

export class SlashCommandSubcommandGroup {
    private _ = new SlashCommandSubcommandGroupBuilder();
    private _commands: SlashCommandSubcommand[] = [];

    constructor() {}

    public setName(name: string) {
        this._.setName(name.toLowerCase().trim());
        return this;
    }

    public setDescription(description: string) {
        this._.setDescription(description);
        return this;
    }

    public addCommands(...commands: SlashCommandSubcommand[]) {
        for (const command of commands) {
            if (!this.getCommand(command.name)) {
                this._commands.push(command);
                this._.addSubcommand(command.onlyBuilder());
            }
        }

        return this;
    }

    public getCommand(commandName: string) {
        return this._commands.find(
            (c) => c.name.toLowerCase().trim() == commandName.toLowerCase().trim()
        );
    }

    public get name() {
        return this._.name;
    }

    public get description() {
        return this._.description;
    }

    public get commands() {
        return this._commands;
    }

    /**
     * # Internal usage
     */
    public onlyBuilder() {
        return this._;
    }

    public toJSON() {
        return this._.toJSON();
    }
}
