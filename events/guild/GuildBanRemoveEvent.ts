import { GuildBan } from "discord.js";
import logGuildBanRemove from "../../modules/loggers/logGuildBanRemove";

export class GuildBanRemoveEvent {
    private static _eventName = "guildBanRemove";

    public static async handle(ban: GuildBan) {
        await logGuildBanRemove(ban);
    }

    public static get eventName() {
        return this._eventName;
    }
}
