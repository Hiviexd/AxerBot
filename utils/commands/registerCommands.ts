import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

const token = String(process.env.TOKEN);
const client_id = String(process.env.CLIENT_ID);

const rest = new REST({ version: "9" }).setToken(token);

export default async (commands: any[]) => {
	try {
		console.log("Started refreshing application (/) commands.");

		await rest.put(Routes.applicationCommands(client_id), {
			body: commands,
		});

		console.log("Successfully reloaded application (/) commands.");
	} catch (error) {
		console.error(error);
	}
};
