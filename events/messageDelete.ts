import { AxerBot } from "../models/core/AxerBot";
import logMessageDelete from "../modules/loggers/logMessageDelete";

export default {
    name: "messageDelete",
    execute(bot: AxerBot) {
        try {
            bot.on("messageDelete", async (message) => {
                await logMessageDelete(message);
            });
        } catch (e: any) {
            console.error(e);
        }
    },
};
