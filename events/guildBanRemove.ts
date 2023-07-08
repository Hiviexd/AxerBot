import { AxerBot } from "../models/core/AxerBot";
import logGuildBanRemove from "../modules/loggers/logGuildBanRemove";

export default {
    name: "guildBanRemove",
    execute(bot: AxerBot) {
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
