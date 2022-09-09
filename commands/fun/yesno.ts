import { Client, Message, CommandInteraction, GuildMember } from "discord.js";
import { parseTextFile } from "../../helpers/text/processText";

export default {
	name: "yesno",
	help: {
		description: "Yes or no? I can help you decide!",
		syntax: "{prefix}yesno `option`",
		example: "{prefix}yesno `axer cringe?`",
	},
	config: {
		type: 1,
		options: [
			{
				name: "question",
				description: "Type your question here!",
				type: 3,
				required: true,
			},
		],
	},
	interaction: true,
	category: "fun",
	run: async (bot: Client, command: CommandInteraction, args: string[]) => {
		await command.deferReply();
        
		//get question from options
		const question = command.options.getString("question");

		const phrases = await parseTextFile(
			__dirname.concat("/../../responses/text/yesno.txt")
		);

		if (!(command.member instanceof GuildMember)) return;

		const res = `> ${question}\n${
			phrases[Math.floor(Math.random() * phrases.length)]
		}`;

		command.editReply(res);
	},
};
