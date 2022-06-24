import axios from "axios";
import { UserActivityResponse } from "../../../types/qat";
import { consoleCheck, consoleError, consoleLog } from "../../core/logger";

export async function userActivity(
	userId: number,
	timeframe: 90 //? 90 days
): Promise<UserActivityResponse> {
	try {
		consoleLog(
			"qatUserActivity fetcher",
			`Fetching user activity for user ${userId}`
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
			status: 200,
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
