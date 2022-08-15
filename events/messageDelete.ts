import { Client } from "discord.js";
import logMessageDelete from "../modules/loggers/logMessageDelete";

export default {
	name: "messageDelete",
	execute(bot: Client) {
		try {
			bot.on("messageDelete", async (message) => {
				await logMessageDelete(message);
			});
		} catch (e: any) {
			console.error(e);
		}
	},
};
