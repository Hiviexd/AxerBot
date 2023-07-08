import { consoleLog } from "../helpers/core/logger";
import { AxerBot } from "../models/core/AxerBot";
import logServerLeaves from "../modules/loggers/logServerLeaves";

export default {
    name: "guildMemberRemove",
    execute(bot: AxerBot) {
        try {
            bot.on("guildMemberRemove", async (member) => {
                const bot_user: any = bot.user;

                if (member.id == bot_user.id) return;

                if (!member.user) return;

                await logServerLeaves(member);

                consoleLog(
                    "guildMemberRemove",
                    `User ${member.user.tag} has left the server ${member.guild.name}!`
                );
            });
        } catch (e: any) {
            console.error(e);
        }
    },
};
