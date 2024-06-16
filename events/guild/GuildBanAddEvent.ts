import { GuildBan } from "discord.js";
import logGuildBanAdd from "../../modules/loggers/logGuildBanAdd";

export class GuildBanAddEvent {
    private static _eventName = "guildBanAdd";

    public static async handle(ban: GuildBan) {
        await logGuildBanAdd(ban);
    }

    public static get eventName() {
        return this._eventName;
    }
}
