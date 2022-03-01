const { default: axios } = require("axios");
const tokenManager = require("./getServerAuthToken");

exports.getUserData = async (user) => {
	try {
		let u = await axios(`https://osu.ppy.sh/api/v2/users/${user}`, {
			headers: {
				"Content-Type": "application/json",
				authorization: `Bearer ${tokenManager.tokens.access_token}`,
			},
		});

		return u.data;
	} catch (e) {
		console.log(e);
		return {
			status: e.status,
			message: e.message,
		};
	}
};
