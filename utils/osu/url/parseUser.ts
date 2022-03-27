import { Message } from "discord.js";
import PlayerEmbed from "../../../messages/osu/PlayerEmbed";
import osuApi from "../osuApi";

export default async (url: string, message: Message) => {
	const user_id = getUserId(url);
	const user = await osuApi.fetch.user(user_id);

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

	PlayerEmbed.send(user, message);
};
