import { Client } from "discord.js";
import { LoggerClient } from "../../models/core/LoggerClient";
import presence from "../../modules/presence/presence";

export class ClientReadyEvent {
    private static _eventName = "ready";
    private static Logger = new LoggerClient("ClientReadyEvent");

    public static handle(client: Client) {
        this.Logger.printInfo(
            `${client.user?.username} is online on ${client.guilds.cache.size} servers!`
        );

        this.handlePresence(client);
    }

    private static handlePresence(client: Client) {
        presence(client, false); // ! false = not ready

        setInterval(() => {
            presence(client, true); // ! true = ready
        }, 15000);
    }

    public static get eventName() {
        return this._eventName;
    }
}
