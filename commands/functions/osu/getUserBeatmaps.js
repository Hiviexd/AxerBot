/**
 * * ======================== getUserBeatmap
 * ? Get user beatmaps and return a object with the data
 */

const { default: axios } = require("axios");
const moment = require("moment");
const { parseDate } = require("../../../utils/parseDate");
const tokenManager = require("./getServerAuthToken");
const { getUserData } = require("./getUserData");

/**
 * @param {String} user
 * - Username or ID to fetch
 */
exports.getUserBeatmaps = async (user) => {
	if (typeof user != "string")
		return new Error("Invalid user param value type: ".concat(typeof user));

	let u = await getUserData(user);

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
			mapping_since: parseDate(
				new Date(
					new Date().getTime() -
						new Date(all_beatmaps.sets[0].submitted_date).getTime()
				)
			),
		},
		ranked: u.ranked_and_approved_beatmapset_count,
		pending: u.pending_beatmapset_count,
		loved: u.loved_beatmapset_count,
		sets_favourite_count: all_beatmaps.sets_favourites,
		sets_play_count: all_beatmaps.sets_playcount,
		graveyard: u.graveyard_beatmapset_count,
		most_recent: all_beatmaps.sets[all_beatmaps.sets.length - 1],
		most_old: all_beatmaps.sets[0],
		beatmapsets: all_beatmaps.sets,
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
		let state = 0;

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

			b = b.data;

			for (let i = 0; i < b.length; i++) {
				_r.push(b[i]);
			}

			state++;

			if (state == 4) resolveData();
		});

		function resolveData() {
			// ? Sort beatmaps by date
			_r.sort((a, b) => {
				return a.id - b.id;
			});

			function getSetsData() {
				let _d = {
					plays: 0,
					favourites: 0,
				};

				for (let i = 0; i < _r.length; i++) {
					_d.favourites += Number(_r[i].favourite_count);

					_d.plays += Number(_r[i].play_count);
				}

				return _d;
			}

			let sets_data = getSetsData();

			return resolve({
				sets: _r,
				sets_playcount: sets_data.plays,
				sets_favourites: sets_data.favourites,
			});
		}
	});

	let data = await awaitBeatmaps;

	return data;
};
