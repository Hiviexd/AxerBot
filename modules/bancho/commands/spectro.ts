import { PrivateMessage, BanchoClient } from "bancho.js";
import getOrCreateBanchoUser from "../../../database/utils/getOrCreatBanchoUser";
import osuApi from "../../osu/fetcher/osuApi";

export default {
    settings: {
        name: "spectro",
        description: "Generate a spectrogram image from the latest /np beatmap",
    },
    run: async function (
        pm: PrivateMessage,
        bancho: BanchoClient,
        args: string[]
    ) {
        const user = await getOrCreateBanchoUser(pm.user);

        if (!user) return pm.user.sendMessage("User not found! Try again.");

        if (!user.last_beatmap)
            return pm.user.sendMessage("Use /np before use this command!");

        const beatmap = await osuApi.download.beatmapset(user.last_beatmap);
    },
};
