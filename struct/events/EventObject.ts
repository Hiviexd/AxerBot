import { ClientEvents } from "discord.js";

export class EventObject {
    public static _eventName: keyof ClientEvents;

    public static handle(...args: ClientEvents[typeof EventObject.eventName]) {}

    public static get eventName() {
        return this._eventName;
    }
}
