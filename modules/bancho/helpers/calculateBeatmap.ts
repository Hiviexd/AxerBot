import { PrivateMessage } from "bancho.js";

import { parseOsuBeatmapURL } from "../../../helpers/text/parseOsuBeatmapURL";
import { sendBeatmapCalculation } from "./sendBeatmapCalculation";

export async function calculateBeatmapFromAction(pm: PrivateMessage) {
    const action = pm.getAction();

    if (!action) return;

    const split =
        /[A-Za-z0-9]+:\/\/([A-Za-z]+(\.[A-Za-z]+)+)\/[A-Za-z0-9]+\/[0-9]+.*\/[0-9]+/i;
    const args = split.exec(action);

    if (!args) return;

    const beatmapURL = parseOsuBeatmapURL(args[0]);

    if (beatmapURL.error || !beatmapURL.data) return;
    if (!beatmapURL.data.beatmap_id) return;

    sendBeatmapCalculation(pm, beatmapURL.data.beatmap_id);
}
