import { BanchoClient, PrivateMessage } from "bancho.js";
import { verifications } from "./../../../database";
import osuApi from "../../../helpers/osu/fetcher/osuApi";
import validateVerificationRequirements from "../../../modules/verification/client/validateVerificationRequirements";
import { consoleLog } from "../../../helpers/core/logger";

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

        if (isNaN(code))
            return pm.user.sendMessage("[BOT]: Invalid code provided!");

        const targetVerification = await verifications.findOne({
            code,
        });

        if (!targetVerification)
            return pm.user.sendMessage("[BOT]: Invalid code! Try again...");

        const partialUserData = await pm.user.fetchFromAPI();

        await osuApi.fetch.user(partialUserData.id.toString()).then((data) => {
            if (data.status != 200 || !data.data)
                return pm.user.sendMessage(
                    "[BOT]: We can't find your account! Try again..."
                );

            validateVerificationRequirements(
                data.data,
                targetVerification.target_guild,
                targetVerification.target_user,
                targetVerification._id,
                pm
            );
        });
    },
};
