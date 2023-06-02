import { PrivateMessage } from "bancho.js";

import { parseOsuBeatmapURL } from "../../../helpers/text/parseOsuBeatmapURL";
import { sendBeatmapCalculation } from "./sendBeatmapCalculation";
import { banchoUsers } from "../../../database";

export async function calculateBeatmapFromAction(
    pm: PrivateMessage,
    rate?: number
) {
    try {
        const action = pm.getAction();

        if (!action) return;

        const split =
            /[A-Za-z0-9]+:\/\/([A-Za-z]+(\.[A-Za-z]+)+)\/[A-Za-z0-9]+\/[0-9]+.*\/[0-9]+/i;
        const args = split.exec(action);

        if (!args) return;

        const beatmapURL = parseOsuBeatmapURL(args[0]);

        if (beatmapURL.error || !beatmapURL.data) return;

        const user = await pm.user.fetchFromAPI();

        await banchoUsers.updateOne(
            { _id: user.id },
            {
                $set: {
                    last_beatmap: beatmapURL.data.beatmap_id,
                    last_beatmapset: beatmapURL.data.beatmapset_id,
                },
            }
        );

        if (!beatmapURL.data.beatmap_id) return;

        sendBeatmapCalculation({
            pm,
            beatmap_id: beatmapURL.data.beatmap_id,
            rate: rate,
        });
    } catch (e: any) {
        console.error(e);
        pm.user.sendMessage(
            `Can't calculate this beatmap! Reason: ${
                e.message || "unknown error"
            }`
        );
    }
}
