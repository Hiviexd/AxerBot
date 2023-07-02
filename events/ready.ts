import { Client } from "discord.js";
import { consoleCheck } from "../helpers/core/logger";
import presence from "../modules/presence/presence";
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

            //? Sets and updates the status of the bot every 15 seconds
            presence(bot, bot_user, false); // ! false = not ready

            setInterval(() => {
                presence(bot, bot_user, true); // ! true = ready
            }, 15000);

            //? checks for reminders every 1 second
            qatTracking(bot);
        });
    },
};
