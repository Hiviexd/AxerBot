import { Client } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { consoleLog, consoleCheck } from "../core/logger";
import { commands } from "../../commands";

export default (bot: Client) => {
	const _commands: { [key: string]: any } = [
		/*
        ! temp disabling context menu commands because they cause a fatal error where the bot stops working bit doesn't actually crash or exit
		{
			name: "Display player info",
			type: 3,
		},
		{
			name: "Display beatmap info",
			type: 3,
		},
		{
			name: "Display beatmap discussion info",
			type: 3,
		},
		{
			name: "Display comment info",
			type: 3,
		},
        */
	];

	Object.keys(commands).forEach((command) => {
		if (commands[command].config != undefined) {
			let newCommand = {
				name: commands[command].name,
				description: commands[command].help.description,
			};

			newCommand = Object.assign(newCommand, commands[command].config);

			_commands.push(newCommand);
			consoleCheck(
				"registerCommands",
				`Command ${commands[command].name} queued!`
			);
		}
	});

	const rest = new REST({ version: "10" }).setToken(process.env.TOKEN || "");

	(async () => {
		try {
			consoleLog(
				"ContextMenus",
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
				"ContextMenus",
				"Successfully reloaded application (/) commands."
			);
		} catch (error) {
			console.error(error);
			console.error(JSON.stringify(error));
		}
	})();
};
