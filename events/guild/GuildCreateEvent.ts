import { Guild } from "discord.js";
import createNewGuild from "../../database/utils/createNewGuild";

export class GuildCreateEvent {
    private static _eventName = "guildCreate";

    public static handle(guild: Guild) {
        createNewGuild(guild);
    }

    public static get eventName() {
        return this._eventName;
    }
}
