import axios from "axios";
import {
	BeatmapsetResponse,
	BeatmapResponse,
	UserBeatmapetsResponse,
	BeatmapsetDiscussionPostResponse,
} from "../../../types/beatmap";
import { consoleCheck, consoleError, consoleLog } from "../../core/logger";

export async function beatmap(beatmap_id: string): Promise<BeatmapResponse> {
	try {
		consoleLog("beatmap fetcher", `Fetching beatmap ${beatmap_id}`);

		const req = await axios(
			"https://osu.ppy.sh/api/v2/beatmaps/".concat(beatmap_id),
			{
				headers: {
					authorization: `Bearer ${process.env.OSU_API_ACCESS_TOKEN}`,
				},
			}
		);

		const res = req.data;

		consoleCheck("beatmap fetcher", `Beatmap ${beatmap_id} found!`);

		return {
			status: 200,
			data: res,
		};
	} catch (e: any) {
		consoleError("beatmap fetcher", "Wtf an error:");
		console.error(e);

		return {
			status: 500,
			data: e,
		};
	}
}

export async function beatmapset(
	beatmapset_id: string
): Promise<BeatmapsetResponse> {
	try {
		consoleLog("beatmap fetcher", `Fetching beatmapset ${beatmapset_id}`);

		const req = await axios(
			"https://osu.ppy.sh/api/v2/beatmapsets/".concat(beatmapset_id),
			{
				headers: {
					authorization: `Bearer ${process.env.OSU_API_ACCESS_TOKEN}`,
				},
			}
		);

		const res = req.data;

		consoleCheck("beatmap fetcher", `Beatmapset ${beatmapset_id} found!`);

		return {
			status: 200,
			data: res,
		};
	} catch (e: any) {
		consoleError("beatmap fetcher", "Wtf an error:");
		console.error(e);

		return {
			status: 500,
			data: e,
		};
	}
}

export async function beatmapsetDiscussionPost(
	post_id: string,
	type: string
): Promise<BeatmapsetDiscussionPostResponse> {
	try {
		consoleLog(
			"beatmap fetcher",
			`Fetching beatmapset discussion post ${post_id}`
		);

		const req = await axios(
			`https://osu.ppy.sh/api/v2/beatmapsets/discussions/posts?beatmapset_discussion_id=${post_id}&types[]=${type}&limit=500`,
			{
				headers: {
					authorization: `Bearer ${process.env.OSU_API_ACCESS_TOKEN}`,
				},
			}
		);

		const res = req.data;

		consoleCheck(
			"beatmap fetcher",
			`Beatmapset discussion post ${post_id} found!`
		);

		return {
			status: 200,
			data: res,
		};
	} catch (e: any) {
		consoleError("beatmap fetcher", "Wtf an error:");
		console.error(e);

		return {
			status: 500,
			data: e,
		};
	}
}

export async function userBeatmaps(
	user_id: string
): Promise<UserBeatmapetsResponse> {
	try {
		consoleLog(
			"beatmap fetcher",
			`Fetching user (${user_id}) beatmapsets `
		);

		// * =============== Data fetching
		let search_types = ["graveyard", "loved", "pending", "ranked"];

		let awaitBeatmaps = new Promise<any>((resolve, reject) => {
			// ? Return value
			let _r: Array<any> = [];
			let state = 0;

			search_types.forEach(async (status) => {
				let b = await axios(
					`https://osu.ppy.sh/api/v2/users/${user_id}/beatmapsets/${status}?limit=500`,
					{
						headers: {
							"Content-Type": "application/json",
							authorization: `Bearer ${process.env.OSU_API_ACCESS_TOKEN}`,
						},
					}
				);

				let res: Array<any> = b.data;

				for (let i = 0; i < res.length; i++) {
					_r.push(res[i]);
				}

				state++;

				if (state == 4) resolveData();
			});

			function resolveData() {
				// ? Sort beatmaps by date
				_r.sort((a, b) => {
					return Number(a.id) - Number(b.id);
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
					status: 200,
					data: {
						sets: _r,
						last: _r[_r.length - 1],
						first: _r[0],
						sets_playcount: sets_data.plays,
						sets_favourites: sets_data.favourites,
					},
				});
			}
		});

		let data = await awaitBeatmaps;

		return data;
	} catch (e: any) {
		consoleError("beatmap fetcher", "Wtf an error:");
		console.error(e);

		return {
			status: 500,
			data: e,
		};
	}
}
