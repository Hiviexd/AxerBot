import { VoiceState } from "discord.js";
import logVoiceStateUpdate from "../../modules/loggers/logVoiceStateUpdate";

export class VoiceStateUpdateEvent {
    private static _eventName = "voiceStateUpdate";

    public static async handle(oldState: VoiceState, newState: VoiceState) {
        await logVoiceStateUpdate(oldState, newState);
    }

    public static get eventName() {
        return this._eventName;
    }
}
