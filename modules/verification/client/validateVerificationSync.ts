import { PrivateMessage } from "bancho.js";
import { User } from "../../../types/user";
import { IVerificationObject, VerificationType } from "./GenerateAuthToken";
import { runVerificationChecks } from "./runVerificationChecks";
import { bot } from "../../..";
import { TextBasedChannel } from "discord.js";
import generateSuccessEmbed from "../../../helpers/text/embeds/generateSuccessEmbed";
import { verifications } from "../../../database";

export async function validateVerificationSync(
    user: User,
    verification: IVerificationObject,
    pm: PrivateMessage
) {
    const guild = await bot.guilds.fetch(verification.target_guild);

    if (!guild) return pm.user.sendMessage("Invalid guild!");

    const member = await guild.members.fetch(verification.target_user);

    if (!member) return pm.user.sendMessage("Invalid member!");

    const errorText = "Something went wrong... Try again later.";

    await verifications.deleteMany({
        target_user: verification.target_user,
        target_guild: verification.target_guild,
        type: VerificationType.validate,
    });

    runVerificationChecks(guild, user, member)
        .then(() => {
            pm.user.sendMessage("Your data is updated!");
        })
        .catch((e) => {
            console.error(e);
            pm.user.sendMessage(`Error! ${errorText}`);
        });
}
