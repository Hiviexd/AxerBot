import {
    ChatInputCommandInteraction,
    GuildMember,
    PermissionResolvable,
    SlashCommandBuilder,
} from "discord.js";
import { SlashCommandSubcommand } from "./SlashCommandSubcommand";
import { SlashCommandSubcommandGroup } from "./SlashCommandSubcommandGroup";
import { checkMemberPermissions } from "../../helpers/core/slashCommandHandler";
import MissingPermissions from "../../responses/embeds/MissingPermissions";
import { consoleLog } from "../../helpers/core/logger";
import { ContextMenuCommand } from "./ContextMenuCommand";

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
    public category = "General";
    public help: { [key: string]: string | string[] } = {};
    public allowDM = false;
    public names: string[] = [];
    public hasModal = false;
    public builder = new SlashCommandBuilder();

    constructor(
        name: string[] | string,
        description: string,
        category: string,
        allowDM: boolean,
        help?: { [key: string | number]: string | string[] },
        permissions?: PermissionResolvable[],
        hasModal?: boolean
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

        if (permissions) {
            this.permissions = permissions;
        }

        this.category = category;

        this.hasModal = hasModal || false;

        this.allowDM = allowDM;
        this.builder.setDMPermission(this.allowDM);
    }

    setHelp(help: { [key: string | number]: string | string[] }) {
        this.help = help;
    }

    get subcommands() {
        return this._subcommands;
    }

    get subcommandGroups() {
        return this._subcommand_groups;
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

        return this;
    }

    hasGroup(name: string) {
        if (!this._subcommand_groups.find((g) => g.builder.name.includes(name)))
            return {
                result: false,
                group: undefined,
            };

        return {
            result: true,
            group: this._subcommand_groups.find((g) =>
                g.builder.name.includes(name)
            ),
        };
    }

    hasSubcommand(name: string) {
        if (!this._subcommands.find((c) => c.builder.name.includes(name)))
            return {
                result: false,
                command: undefined,
            };

        return {
            result: true,
            command: this._subcommands.find((c) =>
                c.builder.name.includes(name)
            ),
        };
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

        consoleLog(
            "CommandHandler",
            `Executing command ${interaction.commandName} ${target.builder.name}`
        );

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

        targetGroup.runCommand(
            interaction,
            interaction.options.getSubcommand()
        );
    }

    isContextMenu(): this is ContextMenuCommand {
        return this instanceof ContextMenuCommand;
    }

    isSlashCommand(): this is SlashCommand {
        return this instanceof SlashCommand;
    }

    async run(interaction: ChatInputCommandInteraction) {
        consoleLog(
            "CommandHandler",
            `Executing command ${interaction.commandName}`
        );

        if (!this.hasModal) await interaction.deferReply();

        if (
            this.permissions.length != 0 &&
            !checkMemberPermissions(
                interaction.member as GuildMember,
                this.permissions
            )
        ) {
            return interaction.deferred
                ? interaction.editReply({
                      embeds: [MissingPermissions],
                  })
                : interaction.reply({
                      embeds: [MissingPermissions],
                  });
        }

        this._executeFunction(interaction);
    }

    toJSON() {
        return this.builder.toJSON();
    }
}
