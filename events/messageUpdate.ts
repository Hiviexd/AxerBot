import { AxerBot } from "../models/core/AxerBot";
import logMessageEdit from "../modules/loggers/logMessageEdit";

export default {
    name: "messageUpdate",
    execute(bot: AxerBot) {
        try {
            bot.on("messageUpdate", async (oldMessage, newMessage) => {
                await logMessageEdit(oldMessage, newMessage);
            });
        } catch (e: any) {
            console.error(e);
        }
    },
};
