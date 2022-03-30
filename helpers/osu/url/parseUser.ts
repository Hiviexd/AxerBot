import { Message } from "discord.js";
import MapperEmbed from "../../../responses/osu/MapperEmbed";
import PlayerEmbed from "../../../responses/osu/PlayerEmbed";
import osuApi from "../fetcher/osuApi";
import * as database from "./../../../database";

export default async (url: string, message: Message) => {
	const user_id = getUserId(url);
	const user = await osuApi.fetch.user(user_id);

	let user_config: any = await database.users.find();

	// console.log(user_config);

	user_config = user_config
		.filter((u: any) => u.osu.username != undefined)
		.filter(
			(u: any) =>
				u.osu.username.toLowerCase() == user.data.username.toLowerCase()
		)[0];

	if (user.status != 200) return;
	if (user.data.statistics?.global_rank == null) return;

	function getUserId(url: string) {
		const playmodes = ["osu", "taiko", "fruits", "mania"];
		let url_object = url.split("/");

		let data = {
			id: "",
			mode: "",
		};

		// ? Remove playmode from url (users/{id}/{mode})
		if (playmodes.includes(url_object[url_object.length - 1])) {
			data.id = url_object[url_object.length - 2]; // ? Mode
			data.mode = url_object[url_object.length - 1]; // ? ID
		} else {
			data.id = url_object[url_object.length - 1]; // ? ID
		}

		return `${data.id}/${data.mode}`;
	}

	console.log(user_config);

	if (user_config != undefined) {
		if (user_config.osu.embed == "player")
			return PlayerEmbed.send(user, message);

		if (user_config.osu.embed == "mapper") {
			const maps = await osuApi.fetch.userBeatmaps(
				user.data.id.toString()
			);

			return MapperEmbed.send(user, maps, message);
		}

		return PlayerEmbed.send(user, message);
	} else {
		return PlayerEmbed.send(user, message);
	}
};
