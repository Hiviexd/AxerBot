import osuApi from "../../osu/fetcher/osuApi";
import statuses from "statuses";
import { getMods } from "./getMods";
import { getMode } from "./getMode";
import { calculateBeatmap } from "../../osu/performance/calculateBeatmap";
import { PrivateMessage } from "bancho.js";

export async function sendBeatmapCalculation(
    pm: PrivateMessage,
    beatmap_id: string,
    mods?: string[] | string
) {
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
        playMods.toString().replace(/,/g, "")
    );

    const { data: beatmap } = beatmapData;

    return pm.user.sendMessage(
        `[${beatmap.url} ${beatmap.beatmapset?.artist} - ${
            beatmap.beatmapset?.title
        } [${beatmap.version}]]${
            !difficulty.difficulty.mods.acronyms.includes("NM")
                ? ` | +${difficulty.difficulty.mods.acronyms.join(
                      ""
                  )} (${Math.round(difficulty.beatmap.bpm)}BPM) `
                : " "
        }|${
            convertMode
                ? ` ${convertModeName[difficulty.beatmap.mode]} | `
                : " "
        }${difficulty.performance
            .map((d) => `${d.acc}% ${Math.round(d.pp)}pp`)
            .join(" ▶ ")}`
    );
}
