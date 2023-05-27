import { PrivateMessage } from "bancho.js";

import { bot } from "../../../";
import { guilds, users, verifications } from "../../../database";
import { consoleCheck, consoleLog } from "../../../helpers/core/logger";
import { sendLoggingEmbed } from "../../../responses/verification/sendLoggerEmbed";
import { sendVerifiedEmbed } from "../../../responses/verification/sendVerifiedEmbed";
import { User } from "../../../types/user";
import { runVerificationChecks } from "./runVerificationChecks";
import { IVerificationObject, VerificationType } from "./GenerateAuthToken";
import { AxerBancho } from "../../bancho/client";

export default async (
    bancho: AxerBancho,
    user: User,
    verification: IVerificationObject,
    pm: PrivateMessage
) => {
    try {
        const verificationsWithSameCode = await verifications.find({
            code: verification.code,
        });

        if (verificationsWithSameCode.length > 1) {
            await verifications.deleteMany({ code: verification.code });
            return {
                status: 403,
                message:
                    "Gratz! You hit the 0,0001% of chance of have the same code of another user! But you need to leave then join the server again to get a new token.",
            };
        }

        const guild = await bot.guilds.fetch(verification.target_guild);

        if (!guild)
            return {
                status: 404,
                message: "Guild not found!",
            };

        const member = await guild.members.fetch({
            user: verification.target_user,
        });

        if (!member)
            return {
                status: 404,
                message: "Member not found!",
            };

        consoleLog(
            "Verification",
            `Validating user ${member.user.tag} in ${member.guild.name}`
        );

        const guild_db = await guilds.findById(guild.id);

        if (!guild_db)
            return {
                status: 404,
                message: "Guild not found in db!",
            };

        await runVerificationChecks(guild, user, member);

        bancho.emit("verification", {
            guild,
            member,
            user,
        });

        sendLoggingEmbed(user, guild, member, guild_db);
        await verifications.deleteMany({
            target_guild: verification.target_guild,
            target_user: verification.target_user,
            type: VerificationType.default,
        });

        pm.user.sendMessage(`You're verified! Welcome to ${guild.name}.`);

        consoleCheck(
            "Verification",
            `User ${member.user.tag} verified in ${member.guild.name}`
        );

        return {
            status: 200,
            message: "Done!",
        };
    } catch (e: any) {
        console.error(e);
        return {
            status: 500,
            message: e.message,
        };
    }
};
