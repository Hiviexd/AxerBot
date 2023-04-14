import { BanchoClient, PrivateMessage } from "bancho.js";

import { BanchoCommands } from ".";
import { sendBeatmapCalculation } from "../helpers/sendBeatmapCalculation";
import getOrCreateBanchoUser from "../../../database/utils/getOrCreatBanchoUser";

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

        sendBeatmapCalculation(pm, user.last_beatmap, args[0]);
    },
};
