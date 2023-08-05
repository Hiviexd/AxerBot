import { PrivateMessage } from "bancho.js";
import { User } from "../../../types/user";
import { IVerificationObject, VerificationType } from "./GenerateAuthToken";
import { runVerificationChecks } from "./runVerificationChecks";
import { bot } from "../../..";
import { TextBasedChannel } from "discord.js";
import generateSuccessEmbed from "../../../helpers/text/embeds/generateSuccessEmbed";
import { users, verifications } from "../../../database";

export async function validateAccountValidationRequest(
    user: User,
    verification: IVerificationObject,
    pm: PrivateMessage
) {
    const errorText = "Something went wrong... Try again later.";

    await verifications.deleteMany({
        target_user: verification.target_user,
        type: VerificationType.accountVerification,
    });

    await users
        .findByIdAndUpdate(verification.target_user, {
            verified_id: user.id,
        })
        .then(() => {
            pm.user.sendMessage("Your account is verified!");
        })
        .catch((e) => {
            console.error(e);
            pm.user.sendMessage(`Error! ${errorText}`);
        });
}
