import { Client } from "discord.js";
import { consoleCheck } from "../helpers/core/logger";
import remindersChecker from "../modules/reminders/remindersChecker";
import serverCountInStatus from "../modules/serverCount/serverCountInStatus";
import qatTracking from "../modules/tracking/qatTracking";

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

			//? Sets and updates the status of the bot every minute
			serverCountInStatus(bot, bot_user);

			setInterval(() => {
				serverCountInStatus(bot, bot_user);
			}, 60000);

			//? checks for reminders every 1 second

			remindersChecker(bot);
			qatTracking(bot);
		});
	},
};
