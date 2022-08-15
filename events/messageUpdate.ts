import { Client } from "discord.js";
import logMessageEdit from "../modules/loggers/logMessageEdit";

export default {
	name: "messageUpdate",
	execute(bot: Client) {
		try {
			bot.on("messageUpdate", async (oldMessage, newMessage) => {
				await logMessageEdit(oldMessage, newMessage);
			});
		} catch (e: any) {
			console.error(e);
		}
	},
};
