import { PrivateMessage } from "bancho.js";

import getOrCreateBanchoUser from "../../../database/utils/getOrCreateBanchoUser";
import { LegacyBeatmapsetImporter } from "../../osu/fetcher/beatmap/LegacyBeatmapImporter";
import osuApi from "../../osu/fetcher/osuApi";
import { AxerBancho } from "../client";
import {
    BeatmapRateChanger,
    BeatmapRateChangerOptions,
} from "../../osu/BeatmapEditor/ratechanger/BeatmapRateChanger";
import { BeatmapEditor } from "../../osu/BeatmapEditor/BeatmapEditor";
import { BeatmapDecoder } from "osu-parsers";

export default {
    settings: {
        name: "sv",
        aliases: ["sv", "svrate", "svscale"],
        description: "Change taiko beatmap Slider Velocity speed",
    },
    run: async function (pm: PrivateMessage, bancho: AxerBancho, args: string[]) {
        const userApi = await pm.user.fetchFromAPI();
        if (!userApi) return pm.user.sendMessage("Can't fetch api user");

        const user = await getOrCreateBanchoUser(userApi.id);
        if (!user) return pm.user.sendMessage("User not found! Try again.");

        if (!user.last_beatmap) return pm.user.sendMessage("Use /np before use this command!");

        const beatmapInfo = await osuApi.fetch.beatmap(user.last_beatmap);

        if (beatmapInfo.status != 200) return pm.user.sendMessage("Can't find this beatmap!");

        if (beatmapInfo.data.mode_int != 1)
            return pm.user.sendMessage("This is just available for osu!taiko beatmaps! Sorry.");

        const rateInput = args[0].replace("x", "");

        const sanitizedRate = Number(rateInput);

        if (isNaN(sanitizedRate) || sanitizedRate < 0.5 || sanitizedRate > 5 || sanitizedRate == 1)
            return pm.user.sendMessage("Rate should be between 0.5x - 5.0x and not 1.0x");

        pm.user.sendMessage("Downloading beatmap... This can take a while.");

        if (beatmapInfo.data.total_length > 600)
            return pm.user.sendMessage("This beatmap is too big! Max duration is 10 minutes");

        const beatmap = await osuApi.fetch.osuFile(`${user.last_beatmap}`);

        if (!beatmap.data || beatmap.status != 200 || !beatmap.data)
            return pm.user.sendMessage("Error during beatmap download");

        const newBeatmap = new BeatmapDecoder().decodeFromString(beatmap.data);

        const rateChanger = new BeatmapEditor.SvScaler(newBeatmap, sanitizedRate);

        rateChanger.generate().then((fileId) => {
            return rateChanger.packToOSZ().then(() => {
                pm.user.sendMessage(
                    `Beatmap Slider Velocity scaled ${sanitizedRate.toFixed(2)}x! [${
                        process.env.RATECHANGER_URL
                    }/svscaler/download/${fileId} Download]`
                );
            });
        });
    },
};
