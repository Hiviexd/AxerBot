import {
    ChatInputCommandInteraction,
    PermissionResolvable,
    SlashCommandBuilder,
} from "discord.js";
import { SlashCommandSubcommand } from "./SlashCommandSubcommand";
import { SlashCommandSubcommandGroup } from "./SlashCommandSubcommandGroup";

export type ISlashCommandExecuteFunction = (
    interaction: ChatInputCommandInteraction
) => any;

export type PartialSubcommandExecutionParam = {
    name: string;
    group?: string | null | undefined;
};

export class SlashCommand {
    private _executeFunction!: ISlashCommandExecuteFunction;
    private _subcommand_groups: SlashCommandSubcommandGroup[] = [];
    private _subcommands: SlashCommandSubcommand[] = [];
    public permissions: PermissionResolvable[] = [];
    public category = "misc";
    public help = {};
    public allowDM = false;
    public names: string[] = [];
    public builder = new SlashCommandBuilder();

    constructor(
        name: string[] | string,
        description: string,
        category: string,
        allowDM: boolean,
        help?: { [key: string | number]: string | string[] },
        permissions?: PermissionResolvable[]
    ) {
        this.builder.setDescription(description);

        if (typeof name != "string") {
            this.builder.setName(name[0]);
            this.names = name as string[];
        } else {
            this.builder.setName(name as string);
            this.names = [name as string];
        }

        this.help = Object.assign({ description: description }, help);

        if (permissions) this.permissions = permissions;

        this.category = category;

        this.allowDM = allowDM;
    }

    setHelp(help: { [key: string | number]: string | string[] }) {
        this.help = help;
    }

    /**
     * You need to add commands to the group first!
     * This will be automated run by the handler.
     */
    addSubcommandGroup(group: SlashCommandSubcommandGroup) {
        this._subcommand_groups.push(group);
        this.builder.addSubcommandGroup(group.builder);
        return this;
    }

    addSubcommand(subcommand: SlashCommandSubcommand) {
        this._subcommands.push(subcommand);
        this.builder.addSubcommand(subcommand.builder);
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

    toJSON() {
        return this.builder.toJSON();
    }
}
