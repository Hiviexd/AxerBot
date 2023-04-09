import axios from "axios";
import {
    consoleCheck,
    consoleError,
    consoleLog,
} from "../../../helpers/core/logger";
import { InterOpEventResponse } from "../../../types/qat";

export async function fetchBeatmapEvents(
    beatmap_id: string | number
): Promise<InterOpEventResponse> {
    try {
        consoleLog("qat fetcher", `Fetching beatmap ${beatmap_id} events`);

        const req = await axios(
            `https://bn.mappersguild.com/interOp/events/${beatmap_id}`,
            {
                headers: {
                    username: `${process.env.QAT_USER}`,
                    secret: `${process.env.QAT_SECRET}`,
                },
            }
        );

        const res = req.data;

        consoleCheck("qat fetcher", `Beatmap ${beatmap_id} events found!`);

        return {
            status: 200,
            data: res,
        };
    } catch (e: any) {
        consoleError("qat fetcher", "Wtf an error:");
        console.error(e);

        return {
            status: 500,
            data: e,
        };
    }
}
