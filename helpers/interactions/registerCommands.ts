import { Client } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { consoleLog, consoleCheck } from "../core/logger";
import { AxerCommands } from "../../commands";
import { SlashCommand } from "models/commands/SlashCommand";
import { ContextMenuCommand } from "../../models/commands/ContextMenuCommand";

export default (bot: Client) => {
    const _commands: { [key: string]: any } = [];

    for (const command of AxerCommands) {
        post(command);
    }

    function post(command: SlashCommand | ContextMenuCommand) {
        consoleCheck(
            "registerCommands",
            `Command ${command.names.join("/")} queued!`
        );

        if ((command as SlashCommand).builder) {
            command.names.forEach((name) => {
                if ((command as SlashCommand).builder) {
                    (command as SlashCommand).builder.setName(name);
                    _commands.push((command as SlashCommand).builder.toJSON());
                }
            });
        } else {
            _commands.push((command as ContextMenuCommand).toJSON());
        }
    }

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN || "");

    (async () => {
        try {
            consoleLog(
                "registerCommands",
                "Started refreshing application (/) commands."
            );

            const commandsResponse: any = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID || ""),
                {
                    body: _commands,
                }
            );

            commandsResponse.forEach((command: any) => {
                consoleCheck(
                    "registerCommands",
                    `Command ${command.name} registered!`
                );
            });

            consoleCheck(
                "registerCommands",
                "Successfully reloaded application (/) commands."
            );
        } catch (error) {
            console.error(error);
            console.error(JSON.stringify(error));
        }
    })();
};
