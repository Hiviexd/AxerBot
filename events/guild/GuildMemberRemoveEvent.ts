import { GuildMember } from "discord.js";
import logServerLeaves from "../../modules/loggers/logServerLeaves";
import { LoggerClient } from "../../models/core/LoggerClient";

export class GuildMemberRemoveEvent {
    private static _eventName = "guildMemberRemove";
    private static Logger = new LoggerClient("GuildMemberRemoveEvent");

    public static async handle(member: GuildMember) {
        if (member.id == member.client.user.id) return;

        await logServerLeaves(member);

        this.Logger.printInfo(`User ${member.user.tag} has left the server ${member.guild.name}!`);
    }

    public static get eventName() {
        return this._eventName;
    }
}
