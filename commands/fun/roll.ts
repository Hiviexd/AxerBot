import { Client, Message, CommandInteraction } from "discord.js";

export default {
	name: "roll",
	help: {
		description: "Roll a dice! \nDefault roll is 100.",
		syntax: "{prefix}roll `<value>`",
		example:
			"{prefix}roll\n{prefix}roll `727`\n{prefix}roll `dubs and I ping @everyone`\n",
	},
	config: {
		type: 1,
		options: [
			{
				name: "value",
				description: "727",
				type: 4,
			},
		],
	},
	interaction: true,
	category: "fun",
	run: async (bot: Client, command: CommandInteraction, args: string[]) => {
		await command.deferReply();

		const dice =
			(command.options.getInteger("value")
				? command.options.getInteger("value")
				: 100) || 100;

		let roll = Math.floor(Math.random() * dice) + 1;
		command.editReply(`${command.user} rolled **${roll}**!`);
	},
};
