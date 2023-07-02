import { Client } from "discord.js";
import logVoiceStateUpdate from "../modules/loggers/logVoiceStateUpdate";

export default {
    name: "voiceStateUpdate",
    execute(bot: Client) {
        try {
            bot.on("voiceStateUpdate", async (oldState, newState) => {
                await logVoiceStateUpdate(oldState, newState);
            });
        } catch (e: any) {
            console.error(e);
        }
    },
};
