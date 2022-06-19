import { Client } from "discord.js";
import { consoleCheck } from "../helpers/core/logger";
import timeChecker from "../helpers/reminder/timeChecker";

export default {
	name: "ready",
	execute(bot: Client) {
		bot.once("ready", () => {
			// Log Bot's username and the amount of servers its in to console
			const bot_user: any = bot.user;

			consoleCheck(
				"Ready.ts",
				`${bot_user.username} is online on ${bot.guilds.cache.size} servers!`
			);

			// Set the Presence of the bot user
			bot_user.setPresence({
				activities: [{ name: "-help | -setprefix" }],
			});
			setInterval(timeChecker, 1000, bot);
		});
	},
};
