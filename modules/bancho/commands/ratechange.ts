import { PrivateMessage } from "bancho.js";
import { ExecException } from "child_process";

import getOrCreateBanchoUser from "../../../database/utils/getOrCreateBanchoUser";
import { bufferToStream } from "../../../helpers/transform/bufferToStream";
import { LegacyBeatmapsetImporter } from "../../osu/fetcher/beatmap/LegacyBeatmapImporter";
import osuApi from "../../osu/fetcher/osuApi";
import { AudioSpectrogram } from "../../osu/spectrogram/AudioSpectrogram";
import { AxerBancho } from "../client";
import { BeatmapRateChanger } from "../../osu/ratechanger/BeatmapRateChanger";

export default {
    settings: {
        name: "ratechange",
        description: "Generate a spectrogram image from the latest /np beatmap",
    },
    run: async function (pm: PrivateMessage, bancho: AxerBancho, args: string[]) {
        const userApi = await pm.user.fetchFromAPI();
        if (!userApi) return pm.user.sendMessage("Can't fetch api user");

        const user = await getOrCreateBanchoUser(userApi.id);
        if (!user) return pm.user.sendMessage("User not found! Try again.");

        if (!user.last_beatmapset) return pm.user.sendMessage("Use /np before use this command!");

        const rateInput = args[0];

        if (!rateInput || isNaN(Number(rateInput.replace("x", ""))))
            return pm.user.sendMessage("You should include output rate: !ratechange 1.2x");

        const sanitizedRate = Number(rateInput.replace("x", ""));

        if (sanitizedRate < 0.1 || sanitizedRate > 5)
            return pm.user.sendMessage("Rate should be 0.1x - 5.0x");

        pm.user.sendMessage("Downloading beatmap... This can take a while.");
        const beatmapInfo = await osuApi.fetch.beatmapset(user.last_beatmapset);

        if (beatmapInfo.status != 200) return pm.user.sendMessage("Can't find this beatmap!");

        if (
            (beatmapInfo.data.beatmaps?.sort((b, a) => a.total_length - b.total_length)[0]
                .total_length || 0) > 600
        )
            return pm.user.sendMessage("This beatmap is too big! Max duration is 10 minutes");

        const beatmap = await osuApi.download.beatmapset(user.last_beatmapset);

        if (!beatmap.data || beatmap.status != 200 || !beatmap.data.buffer)
            return pm.user.sendMessage("Error during beatmap download");

        const importer = new LegacyBeatmapsetImporter(beatmap.data.buffer, user.last_beatmapset);
        importer.import();

        importer.on("end", () => {
            pm.user.sendMessage("Beatmap download finished! Working on rate change...");

            importer.loadBeatmaps();

            const beatmaps = importer.getBeatmaps();
            const targetDifficulty = beatmaps.find(
                (b) => String(b.metadata.beatmapId) == user.last_beatmap
            );

            if (!targetDifficulty) {
                importer.deleteBeatmap();

                return pm.user.sendMessage("This beatmapset doesn't has the requested beatmap id!");
            }

            const audioFile = importer.getAudioFileFrom(targetDifficulty.metadata.beatmapId);

            if (!audioFile) {
                importer.deleteBeatmap();

                return pm.user.sendMessage("This difficulty doesn't have an audio file!");
            }

            function parseOptions() {
                const validOptions = ["-noscaleod", "-noscalear"];

                let scaleAr = true;
                let scaleOd = true;

                const options = args.filter(
                    (option) =>
                        option.startsWith("-") && validOptions.includes(option.toLowerCase())
                );

                if (options.includes("-noscalear")) scaleAr = false;
                if (options.includes("-noscaleod")) scaleOd = false;

                return {
                    scaleAr,
                    scaleOd,
                };
            }

            const rateChanger = new BeatmapRateChanger(
                targetDifficulty,
                audioFile,
                sanitizedRate,
                parseOptions()
            );

            rateChanger.generate().then((fileId) => {
                rateChanger.packToOSZ().then(() => {
                    pm.user.sendMessage(
                        `Beatmap rate changed to ${sanitizedRate}x! [https://${process.env.RATECHANGER_URL}/ratechange/download/${fileId} Download]`
                    );
                });
            });
        });
    },
};
