import { Client, CommandInteraction, Message } from "discord.js";

export default {
	example: "!ping",
	category: "misc",
	slash: {
		name: "ping",
		description: "Pong?",
	},
	run: async (
		bot: Client,
		interaction: CommandInteraction,
		args: string[]
	) => {
		return interaction.reply("`" + bot.ws.ping + " ms`");
	},
};
