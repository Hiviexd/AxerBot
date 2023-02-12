import { Client } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { consoleLog, consoleCheck } from "../core/logger";
import { AxerCommands } from "../../commands";
import { SlashCommand } from "models/commands/SlashCommand";

export default (bot: Client) => {
    for (const command of AxerCommands) {
        post(command);
    }

    function post(command: SlashCommand) {
        consoleCheck(
            "registerCommands",
            `Command ${command.names.join("/")} queued!`
        );

        command.names.forEach((name) => {
            command.builder.setName(name);
            // console.log(command.builder.options);
            bot.application?.commands
                .create(command.builder)
                .then((c) => console.log(`command ${c.name} created`));
        });
    }
};
