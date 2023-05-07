import {
    ContextMenuCommandBuilder,
    ContextMenuCommandInteraction,
    GuildMember,
    PermissionResolvable,
} from "discord.js";
import { LoggerClient } from "../core/LoggerClient";
import { checkMemberPermissions } from "../../helpers/core/slashCommandHandler";
import MissingPermissions from "../../responses/embeds/MissingPermissions";
import { SlashCommand } from "./SlashCommand";

export type ContextMenuExecuteFunction = (
    command: ContextMenuCommandInteraction
) => void;

export class ContextMenuCommand extends ContextMenuCommandBuilder {
    private _executeFunction!: ContextMenuExecuteFunction;
    public permissions: PermissionResolvable[] = [];
    public category = "General";
    public help: { [key: string]: string | string[] } = {};
    public allowDM = false;
    public names: string[] = [];
    public hasModal = false;
    public ephemeral = false;
    private Logger = new LoggerClient("CommandHandler");

    constructor() {
        super();

        this.names = [this.name];
    }

    isContextMenu(): this is ContextMenuCommand {
        return this instanceof ContextMenuCommand;
    }

    isSlashCommand(): this is SlashCommand {
        return this instanceof SlashCommand;
    }

    setModal(modal: boolean) {
        this.hasModal = modal;

        return this;
    }

    setEphemeral(ephemeral: boolean) {
        this.ephemeral = ephemeral;

        return this;
    }

    setPermissions(permissions: PermissionResolvable[]) {
        this.permissions = permissions;

        return this;
    }

    setExecuteFunction(fn: ContextMenuExecuteFunction) {
        this._executeFunction = fn;

        return this;
    }

    setHelp(help: { [key: string | number]: string | string[] }) {
        this.help = help;

        return this;
    }

    async run(interaction: ContextMenuCommandInteraction) {
        this.Logger.printInfo(`Executing command ${interaction.commandName}`);

        if (!this.hasModal)
            await interaction.deferReply({ ephemeral: this.ephemeral });

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

        return this;
    }
}
