import { Client } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { consoleLog, consoleCheck } from "../core/logger";

export default (bot: Client) => {
	const commands = [
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
	];

	const rest = new REST({ version: "9" }).setToken(process.env.TOKEN || "");

	(async () => {
		try {
			consoleLog(
				"ContextMenus",
				"Started refreshing application (/) commands."
			);

			await rest.put(
				Routes.applicationCommands(process.env.CLIENT_ID || ""),
				{
					body: commands,
				}
			);

			consoleCheck(
				"ContextMenus",
				"Successfully reloaded application (/) commands."
			);
		} catch (error) {
			console.error(error);
		}
	})();
};
