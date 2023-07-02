import { Client } from "discord.js";
import logGuildBanRemove from "../modules/loggers/logGuildBanRemove";

export default {
    name: "guildBanRemove",
    execute(bot: Client) {
        try {
            bot.on("guildBanRemove", async (ban) => {
                console.log("unban");
                await logGuildBanRemove(ban);
            });
        } catch (e: any) {
            console.error(e);
        }
    },
};
