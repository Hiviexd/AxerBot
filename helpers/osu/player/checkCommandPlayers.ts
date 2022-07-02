import { CommandInteraction, Message } from "discord.js";
import * as database from "../../../database";

export default async (command: CommandInteraction) => {
	const usernameInput = command.options.getString("username", false);
	const userInput = command.options.getUser("user", false);

	console.log(usernameInput);

	let playerName = "";

	if (usernameInput) {
		playerName = usernameInput;
	}

	if (userInput) {
		const u = await database.users.findOne({
			_id: userInput.id,
		});

		if (u != null)
			playerName = u.osu.username != undefined ? u.osu.username : "";
	}

	if (!userInput && !usernameInput) {
		const u = await database.users.findOne({
			_id: command.user.id,
		});

		if (u != null)
			playerName = u.osu.username != undefined ? u.osu.username : "";
	}

	if (playerName.trim() == "") {
		command.editReply("❗ Provide a valid user.");

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
