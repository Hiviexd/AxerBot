import {
    ChatInputCommandInteraction,
    PermissionResolvable,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from "discord.js";
import { ISlashCommandExecuteFunction } from "./SlashCommand";

export class SlashCommandSubcommand {
    private _executeFunction!: ISlashCommandExecuteFunction;
    public allowDM = false;
    public help = {};
    public permissions?: PermissionResolvable[];
    public builder = new SlashCommandSubcommandBuilder();

    constructor(
        name: string,
        description: string,
        allowDM: boolean,
        help?: { [key: string | number]: string | string[] },
        permissions?: PermissionResolvable[]
    ) {
        this.builder.setName(name);
        this.builder.setDescription(description);
        this.allowDM = allowDM;

        this.help = Object.assign({ description: description }, help);

        if (permissions) this.permissions = permissions;
    }

    setHelp(help: { [key: string | number]: string | string[] }) {
        this.help = help;
    }

    setExecuteFunction(fn: ISlashCommandExecuteFunction) {
        this._executeFunction = fn;

        return this;
    }

    run(interaction: ChatInputCommandInteraction) {
        this._executeFunction(interaction);
    }
}
