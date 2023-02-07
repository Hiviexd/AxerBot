import { Client, Message, ChatInputCommandInteraction } from "discord.js";
const { default: owoify } = require("owoify-js");

export default {
	name: "owoify",
	help: {
		description: "Turn your text into owo text!\n I'm not sorry.",
		syntax: "/owoify `<text>`",
	},
	config: {
		type: 1,
		options: [
			{
				name: "text",
				description: owoify("Type your text"),
				type: 3,
				required: true,
			},
		],
	},
	interaction: true,
	category: "fun",
	run: async (
		bot: Client,
		command: ChatInputCommandInteraction,
		args: string[]
	) => {
		await command.deferReply();

		const text = command.options.getString("text", true);

		command.editReply(owoify(text));
	},
};
