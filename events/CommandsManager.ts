import {
    ChatInputCommandInteraction,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { AxerBot } from "../models/core/AxerBot";
import { SlashCommand } from "../models/commands/SlashCommand";
import { LoggerClient } from "../models/core/LoggerClient";
import { AxerCommands } from "../commands";
import { SlashCommandSubcommand } from "../models/commands/SlashCommandSubcommand";
import generateMissingPermsEmbed from "../helpers/text/embeds/generateMissingPermsEmbed";

export class CommandsManager {
    public axer: AxerBot;
    private rawCommands: SlashCommand[] = [];
    private logger = new LoggerClient("CommandsManager");

    constructor(axer: AxerBot) {
        this.axer = axer;
    }

    public async initializeCommands() {
        this.logger.printInfo("Initializing commands...");
        await this.loadCommands();
        await this.uploadCommands();
    }

    private async loadCommands() {
        this.rawCommands = AxerCommands;

        this.logger.printSuccess(`Loaded ${this.rawCommands.length} commands!`);

        return void {};
    }

    private async uploadCommands() {
        const APICommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

        if (!this.axer.application) return this.logger.printError("Invalid application!");

        for (const command of AxerCommands) {
            APICommands.push(...command.toJSONWithAliases());
        }

        await this.axer.application.commands.set(APICommands);

        this.logger.printSuccess(`Uploaded ${APICommands.length} commands!`);

        return void {};
    }

    public async handleCommand(commandInteraction: ChatInputCommandInteraction) {
        const commandName = commandInteraction.commandName;
        const commandGroup = commandInteraction.options.getSubcommandGroup(false);
        const commandSubcommand = commandInteraction.options.getSubcommand(false);
        const command = this.getCommand(commandName);
        const errorString =
            ":x: Command not found! Restart your Discord app. If you already did, report it to any of our devs (Chech /about)";

        if (!command) return commandInteraction.reply(errorString);

        // ? Normal command execution
        if (commandName && !commandGroup && !commandSubcommand) {
            if (!this.hasPermissionsToExecute(command, commandInteraction))
                return commandInteraction.reply({
                    embeds: [generateMissingPermsEmbed(command.permissions.toArray())],
                });

            await this.prepareForExecution(command, commandInteraction);
            await this.executeCommand(command, commandInteraction);
        }

        // ? Execute subcommands from simple commands

        if (commandName && commandSubcommand && !commandGroup) {
            const subcommand = command.getSubcommand(commandSubcommand);

            if (!subcommand) return commandInteraction.reply(errorString);

            if (!this.hasPermissionsToExecute(subcommand, commandInteraction))
                return commandInteraction.reply({
                    embeds: [generateMissingPermsEmbed(command.permissions.toArray())],
                });

            await this.prepareForExecution(subcommand, commandInteraction);
            await this.executeCommand(subcommand, commandInteraction);
        }

        // ? Execute commands from groups
        if (commandName && commandGroup) {
            if (!commandSubcommand) return commandInteraction.reply(errorString);

            const subcommandGroup = command.getGroup(commandGroup);

            if (!subcommandGroup) return commandInteraction.reply(errorString);

            const subcommand = subcommandGroup.getCommand(commandSubcommand);

            if (!subcommand) return commandInteraction.reply(errorString);

            if (!this.hasPermissionsToExecute(subcommand, commandInteraction))
                return commandInteraction.reply({
                    embeds: [generateMissingPermsEmbed(command.permissions.toArray())],
                });

            await this.prepareForExecution(subcommand, commandInteraction);
            await this.executeCommand(subcommand, commandInteraction);
        }
    }

    private getCommand(commandName: string) {
        return this.rawCommands.find(
            (command) => command.name == commandName || command.nameAliases.includes(commandName)
        );
    }

    private async prepareForExecution(
        command: SlashCommand | SlashCommandSubcommand,
        interaction: ChatInputCommandInteraction
    ) {
        this.logger.printInfo(`Executing command ${command.name}`);

        if (!command.hasModal) {
            await interaction.deferReply({
                ephemeral: command.isEphemeral,
            });
        }
    }

    private hasPermissionsToExecute(
        command: SlashCommand | SlashCommandSubcommand,
        interaction: ChatInputCommandInteraction
    ) {
        if (command.permissions.toArray().length < 1) return true;

        return interaction.memberPermissions?.has(command.permissions) || false;
    }

    private async executeCommand(
        command: SlashCommand | SlashCommandSubcommand,
        interaction: ChatInputCommandInteraction
    ) {
        try {
            command.execute(interaction);
        } catch (e) {
            console.error(e);
        }
    }

    // private async executeCommand(
    //     commandName: string,
    //     commandInteraction: ChatInputCommandInteraction
    // ) {
    //     const targetCommand = this.getCommand(commandName);

    //     if (!targetCommand) return; /// ? Is this possible??

    //     if (!targetCommand.hasModal) {
    //         await commandInteraction.deferReply({
    //             ephemeral: targetCommand.isEphemeral,
    //         });
    //     }

    //     targetCommand.execute(commandInteraction);
    // }
}
