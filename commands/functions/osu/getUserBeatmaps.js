/**
 * * ======================== getUserBeatmap
 * ? Get user beatmaps and return a object with the data
 */

const { default: axios } = require("axios");
const moment = require("moment");
const tokenManager = require("./getServerAuthToken");

/**
 * @param {String} user
 * - Username or ID to fetch
 */
exports.getUserBeatmaps = async (user) => {
	if (typeof user != "string")
		return new Error("Invalid user param value type: ".concat(typeof user));

	let u = await axios(`https://osu.ppy.sh/api/v2/users/${user}`, {
		headers: {
			"Content-Type": "application/json",
			authorization: `Bearer ${tokenManager.tokens.access_token}`,
		},
	});

	// ? Use the same variable to store user data (line 17)
	u = u.data;

	function getBeatmaps() {
		let search_types = [
			"favourite",
			"graveyard",
			"ranked",
			"pending",
			"loved",
		];

		// ? Return value
		let _r = [];

		search_types.forEach((status) => {
			let b = axios(
				`https://osu.ppy.sh/api/v2/users/${u.id}/beatmapsets/${status}?limit=500`,
				{
					headers: {
						"Content-Type": "application/json",
						authorization: `Bearer ${tokenManager.tokens.access_token}`,
					},
				}
			).then((b) => {
				// ? Use the same variable to store request response
				b = b.data;

				// ? Add data to return value
				_r = [..._r, b];

				if (status == "loved") return _r;
			});
		});

		// ? Sort beatmaps by date
		_r.sort((a, b) => {
			new Date(a.submitted_date).getTime() -
				new Date(b.submitted_date).getTime();
		});

		return _r;
	}

	function getSize() {
		return (
			u.ranked_and_approved_beatmapset_count +
			u.pending_beatmapset_count +
			u.loved_beatmapset_count +
			u.graveyard_beatmapset_count
		);
	}

	const all_beatmaps = await this.getUserAllBeatmaps(u.username);

	return {
		user: {
			id: u.id,
			username: u.username,
			favourite: u.favourite_beatmapset_count,
			playcount: u.beatmap_playcounts_count,
			mapping_since: moment(all_beatmaps[0].submitted_date).fromNow(),
		},
		ranked: u.ranked_and_approved_beatmapset_count,
		pending: u.pending_beatmapset_count,
		loved: u.loved_beatmapset_count,
		graveyard: u.graveyard_beatmapset_count,
		most_recent: all_beatmaps[all_beatmaps.length - 1],
		most_old: all_beatmaps[0],
		beatmapsets: all_beatmaps,
		size: getSize(),
	};
};

exports.getUserAllBeatmaps = async (user) => {
	if (typeof user != "string")
		return new Error("Invalid user param value type: ".concat(typeof user));

	let u = await axios(`https://osu.ppy.sh/api/v2/users/${user}`, {
		headers: {
			"Content-Type": "application/json",
			authorization: `Bearer ${tokenManager.tokens.access_token}`,
		},
	});

	// ? Use the same variable to store user data (line 17)
	u = u.data;

	// * =============== Data fetching
	let search_types = ["graveyard", "loved", "pending", "ranked"];

	let awaitBeatmaps = new Promise((resolve, reject) => {
		// ? Return value
		let _r = [];

		search_types.forEach(async (status) => {
			let b = await axios(
				`https://osu.ppy.sh/api/v2/users/${u.id}/beatmapsets/${status}?limit=500`,
				{
					headers: {
						"Content-Type": "application/json",
						authorization: `Bearer ${tokenManager.tokens.access_token}`,
					},
				}
			);

			// ? Use the same variable to store request response
			b = b.data;

			// ? Add data to return value
			for (let i = 0; i < b.length; i++) {
				_r.push(b[i]);
			}

			// ? Sort beatmaps by date
			_r.sort((a, b) => {
				return a.id - b.id;
			});

			if (status == "ranked") return resolve(_r);
		});
	});

	let data = await awaitBeatmaps;

	return data;
};
