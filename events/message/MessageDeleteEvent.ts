import { Message } from "discord.js";
import logMessageDelete from "../../modules/loggers/logMessageDelete";

export class MessageDeleteEvent {
    private static _eventName = "messageDelete";

    public static async handle(message: Message) {
        await logMessageDelete(message);
    }

    public static get eventName() {
        return this._eventName;
    }
}
