import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandGroupBuilder,
} from "discord.js";
import { SlashCommandSubcommand } from "./SlashCommandSubcommand";
import { consoleLog } from "../../helpers/core/logger";

export class SlashCommandSubcommandGroup {
    private commands: SlashCommandSubcommand[] = [];
    public builder = new SlashCommandSubcommandGroupBuilder();

    constructor(name: string, description: string) {
        this.builder.setName(name);
        this.builder.setDescription(description);
    }

    addCommand(subcommand: SlashCommandSubcommand) {
        this.commands.push(subcommand);
        this.builder.addSubcommand(subcommand.builder);

        return this;
    }

    get subcommands() {
        return this.commands;
    }

    runCommand(interaction: ChatInputCommandInteraction, subcommand: string) {
        const target = this.commands.find((c) => c.builder.name == subcommand);

        if (!target) return;

        consoleLog(
            "CommandHandler",
            `Executing command ${interaction.commandName} ${this.builder.name} ${target.builder.name}`
        );

        target.run(interaction);
    }
}
