import { Client, CommandInteraction } from "discord.js";

export default {
	name: "choose",
	help: {
		description: "I will choose for you!",
		syntax: "{prefix}choose `<option_1>` or `<option_2>`",
		example: "{prefix}choose `map a song or mod a map`",
	},
	interaction: true,
	config: {
		type: 1,
		options: [
			{
				name: "option_1",
				description: "Something",
				type: 3,
				required: true,
			},
			{
				name: "option_2",
				description: "Something",
				type: 3,
				required: true,
			},
			{
				name: "option_3",
				description: "Something",
				type: 3,
			},
			{
				name: "option_4",
				description: "Something",
				type: 3,
			},
			{
				name: "option_5",
				description: "Something",
				type: 3,
			},
			{
				name: "option_6",
				description: "Something",
				type: 3,
			},
			{
				name: "option_7",
				description: "Something",
				type: 3,
			},
			{
				name: "option_8",
				description: "Something",
				type: 3,
			},
			{
				name: "option_9",
				description: "Something",
				type: 3,
			},
			{
				name: "option_10",
				description: "Something",
				type: 3,
			},
		],
	},
	category: "fun",
	run: async (bot: Client, command: CommandInteraction, args: string[]) => {
		await command.deferReply();
		const choices: string[] = [];

		for (let i = 0; i < 10; i++) {
			const option = command.options.getString(`option_${i + 1}`);

			if (option) {
				choices.push(option);
			}
		}
        const choicesString = choices.join(" or ");

		const randomChoice = choices[Math.floor(Math.random() * choices.length)];

		command.editReply(`> ${choicesString}\n${randomChoice}`);
	},
};
