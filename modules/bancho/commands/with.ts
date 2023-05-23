import { BanchoClient, PrivateMessage } from "bancho.js";
import getOrCreateBanchoUser from "../../../database/utils/getOrCreatBanchoUser";
import { sendBeatmapCalculation } from "../helpers/sendBeatmapCalculation";

export default {
    settings: {
        name: "with",
        description:
            "Calculate the latest /np beatmap pp with given mods (!with <mods>)",
    },
    run: async function (
        pm: PrivateMessage,
        bancho: BanchoClient,
        args: string[]
    ) {
        const userApi = await pm.user.fetchFromAPI();

        if (!userApi) return pm.user.sendMessage("Can't fetch api user");

        const user = await getOrCreateBanchoUser(userApi.id);

        if (!user) return pm.user.sendMessage("User not found! Try again.");

        if (!user.last_beatmap)
            return pm.user.sendMessage("Use /np before use this command!");

        const getRate = () => {
            const rate = isNaN(Number(args[0].slice(0, -1)))
                ? args[1].slice(0, -1)
                : args[0].slice(0, -1); // remove x after the string "1.2x" example
            const rateNumber = Number(rate);

            if (isNaN(rateNumber)) return 1;
            if (rateNumber < 0.1 || rateNumber > 10.0) return 1;

            return Number(rate);
        };

        sendBeatmapCalculation({
            pm,
            beatmap_id: user.last_beatmap,
            mods: args[0],
            rate: getRate(),
        });
    },
};
