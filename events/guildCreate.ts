import createNewGuild from "../database/utils/createNewGuild";
import { AxerBot } from "../models/core/AxerBot";

export default {
    name: "guildCreate",
    execute(bot: AxerBot) {
        bot.on("guildCreate", async (guild) => {
            createNewGuild(guild);
        });
    },
};
