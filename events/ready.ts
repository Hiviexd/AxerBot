import { Client } from "discord.js";
import { consoleCheck } from "../helpers/core/logger";
import remindersChecker from "../modules/reminders/remindersChecker";

export default {
	name: "ready",
	execute(bot: Client) {
		bot.once("ready", () => {
			//? Log the bot's username and the amount of servers its in to console
			const bot_user: any = bot.user;

			consoleCheck(
				"ready.ts",
				`${bot_user.username} is online on ${bot.guilds.cache.size} servers!`
			);

			//? Set the Presence of the bot
			bot_user.setPresence({
				activities: [{ name: `-help | -setprefix | ${bot.guilds.cache.size} servers` }],
			});

			//? checks for reminders every second
			setInterval(remindersChecker, 2000, bot);
		});
	},
};
