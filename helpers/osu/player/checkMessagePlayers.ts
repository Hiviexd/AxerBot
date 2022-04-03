import { Message } from "discord.js";
import * as database from "./../../../database";

export default async (message: Message, args: string[]) => {
	let playerName = args.join(" ") || "";

	if (message.mentions.users.size != 1) {
		if (args.length < 1) {
			const u = await database.users.findOne({
				_id: message.author.id,
			});

			if (u != null) playerName = u.osu.username;
		}
	} else {
		const user = message.mentions.users.first();
		const u = await database.users.findOne({
			_id: user?.id,
		});

		if (u != null) playerName = u.osu.username;
	}

	if (playerName.trim() == "") {
		message.channel.send("❗ Provide a valid user.");

		return {
			status: 404,
			playerName: "",
		};
	}

	return {
		status: 200,
		playerName: playerName,
	};
};
