import axios from "axios";
import { HTTPResponse, QatEvent } from "../../../types/qat";
import { consoleCheck, consoleError, consoleLog } from "../../core/logger";

export async function events(
	beatmapset: string | number
): Promise<HTTPResponse<QatEvent[]>> {
	try {
		consoleLog("qatBeatmapEvents fetcher", `Fetching beatmap events`);

		const req = await axios(
			`https://bn.mappersguild.com/interOp/events/${beatmapset}`,
			{
				headers: {
					username: `${process.env.QAT_USER}`,
					secret: `${process.env.QAT_SECRET}`,
				},
			}
		);

		const res = req.data;

		consoleCheck("qatBeatmapEvents fetcher", `Fetched beatmap events!`);

		return {
			status: res ? 200 : 404,
			data: res,
		};
	} catch (e: any) {
		consoleError("qatBeatmapEvents fetcher", "Encountered an error:");
		console.error(e);

		return {
			status: 500,
			data: e,
		};
	}
}
