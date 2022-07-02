import { Client, CommandInteraction, Message } from "discord.js";

export default {
	name: "ping",
	help: {
		description: "Pong?",
		example: "{prefix}ping",
	},
	config: {
		type: 1,
	},
	interaction: true,
	category: "misc",
	run: async (
		bot: Client,
		interaction: CommandInteraction,
		args: string[]
	) => {
		await interaction.deferReply(); // ? prevent errors

		return interaction.editReply("`" + bot.ws.ping + " ms`");
	},
};
