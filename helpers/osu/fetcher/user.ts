import axios from "axios";
import { UserScoreResponse } from "../../../types/score";
import { UserResponse } from "../../../types/user";
import { consoleCheck, consoleError, consoleLog } from "../../core/logger";

export async function user(
	user_id: string,
	mode?: string
): Promise<UserResponse> {
	try {
		consoleLog("user fetcher", `Fetching user ${user_id}`);

		const req = await axios(parseMode(), {
			headers: {
				authorization: `Bearer ${process.env.OSU_API_ACCESS_TOKEN}`,
			},
		});

		const res = req.data;

		consoleCheck("user fetcher", `user ${user_id} found!`);

		function parseMode() {
			let link = "https://osu.ppy.sh/api/v2/users/".concat(user_id);

			if (mode) {
				link = `https://osu.ppy.sh/api/v2/users/${user_id}/${mode}`;
			}

			return link;
		}

		return {
			status: 200,
			data: res,
		};
	} catch (e: any) {
		consoleError("user fetcher", "Wtf an error:");
		console.error(e);

		return {
			status: 500,
			data: e,
		};
	}
}

export async function userRecent(
	user_id: string,
	include_fails?: number,
	mode?: string
): Promise<UserScoreResponse> {
	try {
		consoleLog("user fetcher", `Fetching user ${user_id} recent scores`);

		const req = await axios(parseMode(), {
			headers: {
				authorization: `Bearer ${process.env.OSU_API_ACCESS_TOKEN}`,
			},
		});

		const res = req.data;

		consoleCheck("user fetcher", `user ${user_id} recent scores found!`);

		if (!include_fails) include_fails = 1;

		function parseMode() {
			let link = `https://osu.ppy.sh/api/v2/users/${user_id}/scores/recent?include_fails=${include_fails}`;

			if (mode) {
				link = `https://osu.ppy.sh/api/v2/users/${user_id}/scores/recent?include_fails=${include_fails}&mode=${mode}`;
			}

			return link;
		}

		return {
			status: 200,
			data: res,
		};
	} catch (e: any) {
		consoleError("user fetcher", "Wtf an error:");
		console.error(e);

		return {
			status: 500,
			data: e,
		};
	}
}
