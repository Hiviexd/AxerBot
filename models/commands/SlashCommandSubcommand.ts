import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
    PermissionResolvable,
    PermissionsBitField,
    SlashCommandAttachmentOption,
    SlashCommandBooleanOption,
    SlashCommandChannelOption,
    SlashCommandIntegerOption,
    SlashCommandMentionableOption,
    SlashCommandNumberOption,
    SlashCommandRoleOption,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
    SlashCommandUserOption,
} from "discord.js";
import { SlashCommandMainFunction } from "./SlashCommand";

export class SlashCommandSubcommand {
    private _ = new SlashCommandSubcommandBuilder();
    private _permissions = new PermissionsBitField();
    private _ephemeral = false;
    private _hasModal = false;
    private _helpFields = {} as { [key: string]: string | string[] };
    private _main: SlashCommandMainFunction = (command: ChatInputCommandInteraction) => void {};

    constructor() {}

    public setName(name: string) {
        this._.setName(name.toLowerCase().trim());
        return this;
    }

    public setDescription(description: string) {
        this._.setDescription(description);
        return this;
    }

    public setPermissions(...permissions: PermissionResolvable[]) {
        this._permissions.add(permissions);
        return this;
    }

    public setEphemeral(isEphemeral: boolean) {
        this._ephemeral = isEphemeral;
        return this;
    }

    public setModal(hasModal: boolean) {
        this._hasModal = hasModal;
        return this;
    }

    public addOptions(
        ...options: (
            | SlashCommandAttachmentOption
            | SlashCommandStringOption
            | SlashCommandRoleOption
            | SlashCommandUserOption
            | SlashCommandUserOption
            | SlashCommandNumberOption
            | SlashCommandBooleanOption
            | SlashCommandChannelOption
            | SlashCommandIntegerOption
            | SlashCommandMentionableOption
        )[]
    ) {
        for (const option of options) {
            if (option.type == ApplicationCommandOptionType.Attachment)
                this._.addAttachmentOption(option);
            if (option.type == ApplicationCommandOptionType.Boolean)
                this._.addBooleanOption(option);
            if (option.type == ApplicationCommandOptionType.Channel)
                this._.addChannelOption(option);
            if (option.type == ApplicationCommandOptionType.Integer)
                this._.addIntegerOption(option);
            if (option.type == ApplicationCommandOptionType.Mentionable)
                this._.addMentionableOption(option);
            if (option.type == ApplicationCommandOptionType.Number) this._.addNumberOption(option);
            if (option.type == ApplicationCommandOptionType.Role) this._.addRoleOption(option);
            if (option.type == ApplicationCommandOptionType.String) this._.addStringOption(option);
            if (option.type == ApplicationCommandOptionType.User) this._.addUserOption(option);
        }

        return this;
    }

    public setHelp(helpFields: { [key: string]: string | string[] }) {
        this._helpFields = helpFields;

        return this;
    }

    public setExecutable(f: SlashCommandMainFunction) {
        this._main = f;

        return this;
    }

    public execute(command: ChatInputCommandInteraction) {
        this._main(command);

        return this;
    }

    public get permissions() {
        return this._permissions;
    }

    public get isEphemeral() {
        return this._ephemeral;
    }

    public get hasModal() {
        return this._hasModal;
    }

    public get name() {
        return this._.name;
    }

    public get description() {
        return this._.description;
    }

    public get helpFields() {
        return this._helpFields;
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
