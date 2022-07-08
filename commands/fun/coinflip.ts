import { Client, CommandInteraction, Message } from "discord.js";

export default {
	name: "coinflip",
	help: {
		description: "Feeling lucky? Flip a coin!",
		syntax: "{prefix}coinflip",
	},
	interaction: true,
	config: {
		type: 1,
	},
	category: "fun",
	run: async (bot: Client, command: CommandInteraction, args: string[]) => {
		await command.deferReply();
		let coin = Math.floor(Math.random() * 2);

		command.editReply(
			`**${command.user.username}**'s coin landed on **${
				coin === 0 ? "Heads" : "Tails"
			}**!`
		);
	},
};
