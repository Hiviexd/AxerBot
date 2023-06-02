import osuApi from "../../osu/fetcher/osuApi";
import statuses from "statuses";
import { getMods } from "./getMods";
import { getMode } from "./getMode";
import {
    calculateBeatmap,
    multiplayDifficultyParameter,
} from "../../osu/performance/calculateBeatmap";
import { PrivateMessage } from "bancho.js";
import { StandardDifficultyAttributes } from "osu-standard-stable";
import { CatchDifficultyAttributes } from "osu-catch-stable";

export async function sendBeatmapCalculation({
    pm,
    beatmap_id,
    mods,
    rate,
}: {
    pm: PrivateMessage;
    beatmap_id: string;
    mods?: string[] | string;
    rate?: number;
}) {
    const beatmapData = await osuApi.fetch.beatmap(beatmap_id);

    if (!beatmapData.data || beatmapData.status != 200)
        return pm.user.sendMessage(
            `Error during beatmap fetch: ${statuses(beatmapData.status)}`
        );

    const osuFile = await osuApi.fetch.osuFile(beatmap_id);

    if (osuFile.status != 200 || !osuFile.data)
        return pm.user.sendMessage(
            `Error during beatmap file fetch: ${statuses(osuFile.status)}`
        );

    const playMods = mods ?? getMods(pm.message.replace(//g, "")); // Remove weird unicode that bancho returns if the message is an action

    const convertMode = getMode(pm.message.replace(//g, ""));
    const convertModeName = [null, "osu!taiko", "osu!catch", "osu!mania"]; // First is null to ignore std

    const difficulty = calculateBeatmap(
        osuFile.data,
        convertMode || beatmapData.data.mode_int,
        playMods.toString().replace(/,/g, ""),
        rate
    );

    const { data: beatmap } = beatmapData;

    function getDifficultyAttributes(mode: number) {
        switch (mode) {
            case 0: {
                const difficultyAttributes =
                    difficulty.difficulty as StandardDifficultyAttributes;

                return `OD: ${multiplayDifficultyParameter(
                    difficulty.beatmap.difficulty.overallDifficulty,
                    difficulty.performanceAttributes.mods,
                    rate
                ).toFixed(
                    2
                )} CS: ${difficulty.beatmap.difficulty.circleSize.toFixed(
                    2
                )} AR: ${multiplayDifficultyParameter(
                    difficulty.beatmap.difficulty.overallDifficulty,
                    difficulty.performanceAttributes.mods,
                    rate
                ).toFixed(2)} HP: ${difficultyAttributes.drainRate.toFixed(2)}`;
            }
            case 1: {
                return `OD: ${multiplayDifficultyParameter(
                    difficulty.beatmap.difficulty.overallDifficulty,
                    difficulty.performanceAttributes.mods,
                    rate
                ).toFixed(
                    2
                )} HP: ${difficulty.beatmap.difficulty.drainRate.toFixed(2)}`;
            }
            case 2: {
                const difficultyAttributes =
                    difficulty.difficulty as CatchDifficultyAttributes;

                return `OD: ${multiplayDifficultyParameter(
                    difficulty.beatmap.difficulty.overallDifficulty,
                    difficulty.performanceAttributes.mods,
                    rate
                ).toFixed(
                    2
                )} CS: ${difficulty.beatmap.difficulty.circleSize.toFixed(
                    2
                )} AR: ${multiplayDifficultyParameter(
                    difficultyAttributes.approachRate,
                    difficulty.performanceAttributes.mods,
                    rate
                ).toFixed(
                    2
                )} HP: ${difficulty.beatmap.difficulty.drainRate.toFixed(2)}`;
            }
            case 3: {
                return `OD: ${multiplayDifficultyParameter(
                    difficulty.beatmap.difficulty.overallDifficulty,
                    difficulty.performanceAttributes.mods,
                    rate
                ).toFixed(
                    2
                )} HP: ${difficulty.beatmap.difficulty.drainRate.toFixed(2)}`;
            }
        }
    }

    const attributesText = `${`BPM: ${Math.round(
        difficulty.beatmap.bpmMax * (rate || 1)
    )} ${getDifficultyAttributes(beatmap.mode_int)}${
        rate ? ` Rate: ${rate}x` : ""
    } |`}${
        convertMode ? ` ${convertModeName[difficulty.beatmap.mode]} | ` : " "
    }`;

    return pm.user.sendMessage(
        `[${beatmap.url} ${beatmap.beatmapset?.artist} - ${
            beatmap.beatmapset?.title
        } [${beatmap.version}]]${
            !difficulty.difficulty.mods.acronyms.includes("NM")
                ? ` | ${difficulty.difficulty.starRating.toFixed(
                      2
                  )}* +${difficulty.difficulty.mods.acronyms.join("")}`
                : `| ${difficulty.difficulty.starRating.toFixed(2)}* NoMod`
        } | ${attributesText}${difficulty.performance
            .map((d) => `${d.acc}% ${Math.round(d.pp)}pp`)
            .join(" ▶ ")}`
    );
}
