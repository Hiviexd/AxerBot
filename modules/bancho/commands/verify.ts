import { BanchoClient, PrivateMessage } from "bancho.js";

import { consoleLog } from "../../../helpers/core/logger";
import osuApi from "../../../modules/osu/fetcher/osuApi";
import validateVerificationRequirements from "../../../modules/verification/client/validateVerificationRequirements";
import {
    IVerificationObject,
    VerificationType,
} from "../../verification/client/GenerateAuthToken";
import { validateVerificationSync } from "../../verification/client/validateVerificationSync";
import { verifications } from "./../../../database";

export default {
    settings: {
        name: "verify",
        description: "Verify your discord account!",
    },
    run: async function (
        pm: PrivateMessage,
        bancho: BanchoClient,
        args: string[]
    ) {
        const code = Number(args[0]);

        consoleLog(
            "Verify Command",
            `Command executed by ${pm.user.ircUsername} with code ${code}`
        );

        if (isNaN(code)) return pm.user.sendMessage("Invalid code provided!");

        const targetVerification = await verifications.findOne({
            code,
        });

        if (!targetVerification)
            return pm.user.sendMessage("Invalid code! Try again...");

        const partialUserData = await pm.user.fetchFromAPI();

        await osuApi.fetch.user(partialUserData.id.toString()).then((data) => {
            if (data.status != 200 || !data.data)
                return pm.user.sendMessage(
                    "We can't find your account! Try again..."
                );

            switch (targetVerification.type) {
                case VerificationType.default:
                    validateVerificationRequirements(
                        data.data,
                        targetVerification as unknown as IVerificationObject,
                        pm
                    );
                    break;
                case VerificationType.validate:
                    validateVerificationSync(
                        data.data,
                        targetVerification as unknown as IVerificationObject,
                        pm
                    );
                    break;
            }
        });
    },
};
