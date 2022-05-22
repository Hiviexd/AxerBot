import { Client, Message } from "discord.js";

export default {
	name: "roll",
	help: {
		description: "Roll a dice! \nDefault roll is 100.",
		syntax: "{prefix}roll `<value>`",
		example: "{prefix}roll\n{prefix}roll `727`\n{prefix}roll `dubs and I ping @everyone`\n",

	},
	category: "fun",
	run: (bot: Client, message: Message, args: string[]) => {
		let dice: number;
		(args.length < 1)? dice = 100: dice = Number(args[0]);
		if (isNaN(dice)) {
			dice = 100;
		}
		let roll = Math.floor(Math.random() * dice) + 1;
		message.channel.send(`**${message.author.username}** rolled **${roll}**!`);
	},
};
