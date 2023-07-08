import { AxerBot } from "../models/core/AxerBot";
import logGuildBanAdd from "../modules/loggers/logGuildBanAdd";

export default {
    name: "guildBanAdd",
    execute(bot: AxerBot) {
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
