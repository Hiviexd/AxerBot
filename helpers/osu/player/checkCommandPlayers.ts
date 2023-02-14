import { ChatInputCommandInteraction } from "discord.js";

import * as database from "../../../database";

export default async (command: ChatInputCommandInteraction) => {
    const usernameInput = command.options.getString("username", false);
    const userInput = command.options.getUser("user", false);

    let playerName = "";

    if (usernameInput) {
        playerName = usernameInput;
    }

    if (userInput) {
        const u = await database.users.findOne({
            _id: userInput.id,
        });

        if (u != null)
            playerName =
                u.osu.username.toString() != undefined
                    ? u.osu.username.toString()
                    : "";
    }

    if (!userInput && !usernameInput) {
        const u = await database.users.findOne({
            _id: command.user.id,
        });

        if (u != null)
            playerName =
                u.osu.username.toString() != undefined
                    ? u.osu.username.toString()
                    : "";
    }

    if (playerName.toString().trim() == "") {
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
