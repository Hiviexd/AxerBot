import { PrivateMessage } from "bancho.js";

import getOrCreateBanchoUser from "../../../database/utils/getOrCreateBanchoUser";
import { LegacyBeatmapsetImporter } from "../../osu/fetcher/beatmap/LegacyBeatmapImporter";
import osuApi from "../../osu/fetcher/osuApi";
import { AxerBancho } from "../client";
import {
    BeatmapRateChanger,
    BeatmapRateChangerOptions,
} from "../../osu/ratechanger/BeatmapRateChanger";

export enum RateChangeInputType {
    BPM,
    Rate,
    Invalid,
}

function isRateOrBpmInput(input: string) {
    input = input || "";

    const sanitizedInput = input.trim().toLowerCase();

    if (!sanitizedInput) return { value: 0, type: RateChangeInputType.Invalid };

    if (sanitizedInput.endsWith("bpm")) {
        if (isNaN(Number(sanitizedInput.slice(0, -3))))
            return { value: 0, type: RateChangeInputType.Invalid };

        const bpmValue = Number(sanitizedInput.slice(0, -3));

        if (bpmValue > 800 || bpmValue < 60) return { value: 0, type: RateChangeInputType.Invalid };

        return { value: Number(sanitizedInput.slice(0, -3)), type: RateChangeInputType.BPM };
    }

    if (!isNaN(Number(sanitizedInput.replace("x", "")))) {
        const rateInput = Number(sanitizedInput.replace("x", ""));

        if (rateInput > 5 || rateInput < 0.2)
            return { value: 0, type: RateChangeInputType.Invalid };

        return { value: rateInput, type: RateChangeInputType.Rate };
    }

    return { value: 0, type: RateChangeInputType.Invalid };
}

function getRateFromBpm(baseBpm: number, targetBpm: number): number {
    if (baseBpm == 0) baseBpm = 1;
    if (targetBpm == 0) targetBpm = 1;

    return targetBpm / baseBpm;
}

export default {
    settings: {
        name: "ratechange",
        aliases: ["rc"],
        description: "Change beatmap playback rate",
    },
    run: async function (pm: PrivateMessage, bancho: AxerBancho, args: string[]) {
        const userApi = await pm.user.fetchFromAPI();
        if (!userApi) return pm.user.sendMessage("Can't fetch api user");

        const user = await getOrCreateBanchoUser(userApi.id);
        if (!user) return pm.user.sendMessage("User not found! Try again.");

        if (!user.last_beatmapset) return pm.user.sendMessage("Use /np before use this command!");

        const beatmapInfo = await osuApi.fetch.beatmapset(user.last_beatmapset);

        if (beatmapInfo.status != 200) return pm.user.sendMessage("Can't find this beatmap!");

        const rateInput = args[0];

        const rateInputStatistics = isRateOrBpmInput(rateInput);

        if (rateInputStatistics.type == RateChangeInputType.Invalid)
            return pm.user.sendMessage(
                "You should include output rate: !ratechange 1.2x or !ratechange 220bpm"
            );

        const sanitizedRate =
            rateInputStatistics.type == RateChangeInputType.Rate
                ? Number(rateInputStatistics.value.toFixed(2))
                : getRateFromBpm(beatmapInfo.data.bpm, rateInputStatistics.value);

        if (sanitizedRate < 0.1 || sanitizedRate > 5 || sanitizedRate == 1)
            return pm.user.sendMessage("Rate should be between 0.2x - 5.0x and not 1.0x");

        pm.user.sendMessage("Downloading beatmap... This can take a while.");

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

            function shouldScaleArOrOd() {
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

            const scaleArOrOd = shouldScaleArOrOd();
            const options = {
                scaleAr: scaleArOrOd.scaleAr,
                scaleOd: scaleArOrOd.scaleOd,
                inputType: rateInputStatistics.type,
            } as BeatmapRateChangerOptions;

            const rateChanger = new BeatmapRateChanger(
                targetDifficulty,
                audioFile,
                sanitizedRate,
                options
            );

            rateChanger.generate().then((fileId) => {
                return rateChanger.packToOSZ().then(() => {
                    pm.user.sendMessage(
                        `Beatmap rate changed to ${sanitizedRate.toFixed(2)}x! [${
                            process.env.RATECHANGER_URL
                        }/ratechange/download/${fileId} Download]`
                    );
                });
            });
        });
    },
};
