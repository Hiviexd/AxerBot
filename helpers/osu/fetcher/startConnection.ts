/**
 * * ======================== startConnection
 * ? Get authorization token
 */

import { consoleCheck, consoleError, consoleLog } from "../../core/logger";
import axios from "axios";
const osu_client_id = process.env.OSU_CLIENT_ID;
const osu_client_secret = process.env.OSU_CLIENT_SECRET;

async function listen() {
	consoleLog("getServerAuthToken", "Refreshing server authorization token");

	let tokens: any = {};

	try {
		let _t = await axios("https://osu.ppy.sh/oauth/token", {
			method: "post",
			headers: {
				"Content-Type": "application/json",
			},
			data: {
				client_id: osu_client_id,
				client_secret: osu_client_secret,
				grant_type: "client_credentials",
				scope: "public",
			},
		});

		tokens = _t.data;

		// Auto-Refresh token
		setTimeout(listen, Number(tokens.expires_in) * 1000);

		process.env.OSU_API_ACCESS_TOKEN = tokens.access_token;

		console.log(process.env.OSU_API_ACCESS_TOKEN);

		consoleCheck(
			"getServerAuthToken",
			"Server authorization token refreshed"
		);

		return tokens;
	} catch (e: any) {
		consoleError("getServerAuthToken", "Error during token refresh:\n");
		console.error(e);

		setTimeout(listen, 5000);
		return tokens;
	}
}

listen();
