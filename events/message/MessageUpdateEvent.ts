import { Message } from "discord.js";
import logMessageEdit from "../../modules/loggers/logMessageEdit";

export class MessageUpdateEvent {
    private static _eventName = "messageUpdate";

    public static async handle(oldMessage: Message, newMessage: Message) {
        await logMessageEdit(oldMessage, newMessage);
    }

    public static get eventName() {
        return this._eventName;
    }
}
