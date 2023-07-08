import { AxerBot } from "../models/core/AxerBot";
import logVoiceStateUpdate from "../modules/loggers/logVoiceStateUpdate";

export default {
    name: "voiceStateUpdate",
    execute(bot: AxerBot) {
        try {
            bot.on("voiceStateUpdate", async (oldState, newState) => {
                await logVoiceStateUpdate(oldState, newState);
            });
        } catch (e: any) {
            console.error(e);
        }
    },
};
