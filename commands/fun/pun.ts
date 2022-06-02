import { Client, Message } from "discord.js";
import axios from "axios";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";

export default {
	name: "pun",
	help: {
		description: "Get a random pun!",
		syntax: "{prefix}pun",
	},
	category: "fun",
	run: async (bot: Client, message: Message, args: string[]) => {
		const config = {
			headers: {
				Accept: "application/json",
				"user-agent": "Axerbot",
			},
		};
		const url = "https://icanhazdadjoke.com/";

		try {
			const req = await axios.get(url, config);
			message.channel.send({
				embeds: [
					{
						title: "Pun",
						color: "#0080ff",
						description: req.data.joke,
					},
				],
			});
		} catch (e) {
			message.channel.send({
                embeds: [
                    generateErrorEmbed(
                        `❌ A server error occured, try again later.`
                    ),
                ],
            });
		}
	},
};
