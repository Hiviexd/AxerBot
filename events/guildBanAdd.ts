import { Client } from "discord.js";
import logGuildBanAdd from "../modules/loggers/logGuildBanAdd";

export default {
    name: "guildBanAdd",
    execute(bot: Client) {
        try {
            bot.on("guildBanAdd", async (ban) => {
                console.log("ban");
                await logGuildBanAdd(ban);
            });
        } catch (e: any) {
            console.error(e);
        }
    },
};
