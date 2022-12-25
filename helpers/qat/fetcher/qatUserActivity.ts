import axios from "axios";
import { UserActivityResponse } from "../../../types/qat";
import { consoleCheck, consoleError, consoleLog } from "../../core/logger";

export async function userActivity(
	userId: number,
	timeframe: number
): Promise<UserActivityResponse> {
	try {
		consoleLog(
			"qatUserActivity fetcher",
			`Fetching user activity for user ${userId} in the past ${timeframe} days...`
		);

		const req = await axios(
			`https://bn.mappersguild.com/interOp/nominationResets/${userId}/${timeframe}`,
			{
				headers: {
					username: `${process.env.QAT_USER}`,
					secret: `${process.env.QAT_SECRET}`,
				},
			}
		);

		const res = req.data;

		consoleCheck(
			"qatUserActivity fetcher",
			`user activity for user ${userId} found!`
		);

		return {
			status: res ? 200 : 404,
			data: res,
		};
	} catch (e: any) {
		consoleError("qatUserActivity fetcher", "Encountered an error:");
		console.error(e);

		return {
			status: 500,
			data: e,
		};
	}
}
