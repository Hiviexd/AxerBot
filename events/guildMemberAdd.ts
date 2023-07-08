import createNewUser from "../database/utils/createNewUser";
import { consoleLog } from "../helpers/core/logger";
import { AxerBot } from "../models/core/AxerBot";
import logServerJoins from "../modules/loggers/logServerJoins";
import StartVerification from "../modules/verification/client/StartVerification";

export default {
    name: "guildMemberAdd",
    execute(bot: AxerBot) {
        try {
            bot.on("guildMemberAdd", async (member) => {
                consoleLog(
                    "guildMemberAdd",
                    `User ${member.user.tag} has joined the server ${member.guild.name}!`
                );

                await createNewUser(member);

                setTimeout(() => {
                    StartVerification(member);
                }, 1000);

                await logServerJoins(member);
            });
        } catch (e: any) {
            console.error(e);
        }
    },
};
