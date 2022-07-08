import { Client, Message, CommandInteraction } from "discord.js";
import axios from "axios";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";

export default {
	name: "pun",
	help: {
		description: "Get a random pun!",
		syntax: "{prefix}pun",
	},
	config: {
		type: 1,
	},
	interaction: true,
	category: "fun",
	run: async (bot: Client, command: CommandInteraction, args: string[]) => {
		await command.deferReply();

		const config = {
			headers: {
				Accept: "application/json",
				"user-agent": "Axerbot",
			},
		};
		const url = "https://icanhazdadjoke.com/";

		try {
			const req = await axios.get(url, config);
			command.editReply({
				embeds: [
					{
						title: "Pun",
						color: "#0080ff",
						description: req.data.joke,
					},
				],
			});
		} catch (e) {
			command.editReply({
				embeds: [
					generateErrorEmbed(
						`❌ A server error occured, try again later.`
					),
				],
			});
		}
	},
};
