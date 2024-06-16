import { GuildMember } from "discord.js";
import { LoggerClient } from "../../models/core/LoggerClient";
import createNewUser from "../../database/utils/createNewUser";
import logServerJoins from "../../modules/loggers/logServerJoins";
import StartVerification from "../../modules/verification/client/StartVerification";

export class GuildMemberAddEvent {
    private static _eventName = "guildMemberAdd";
    private static Logger = new LoggerClient("GuildMemberAddEvent");

    public static async handle(member: GuildMember) {
        this.Logger.printInfo(
            `User ${member.user.username} has joined the server ${member.guild.name}`
        );

        await createNewUser(member);

        setTimeout(() => {
            StartVerification(member);
        }, 1000);

        await logServerJoins(member);
    }

    public static get eventName() {
        return this._eventName;
    }
}
