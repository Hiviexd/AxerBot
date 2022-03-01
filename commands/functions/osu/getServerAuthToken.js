/**
 * * ======================== getServerAuthToken
 * ? Get authorization token
 */

 require('dotenv').config();
const { default: axios } = require("axios");
const osu_client_id = process.env.OSU_CLIENT_ID;
const osu_client_secret = process.env.OSU_CLIENT_SECRET;

async function listen() {
	console.log("[getServerAuthToken] Refreshing server authorization tokens");

	let tokens = {};

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
	console.log("[getServerAuthToken] Server authorizations refreshed");

	// Auto-Refresh token
	setTimeout(listen, tokens.expires_in);

	return tokens;
}

listen().then((r) => {
	module.exports.tokens = r;
});
