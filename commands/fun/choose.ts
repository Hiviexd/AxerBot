import { Client, Message } from "discord.js";

export default {
	name: "choose",
	help: {
		description: "I will choose for you!",
		syntax: "{prefix}choose `<option_1>` or `<option_2>`",
		example: "{prefix}choose `map a song or mod a map`",
	},
	category: "fun",
	run: (bot: Client, message: Message, args: string[]) => {
		if (args.length < 1) {
			message.channel.send("what am i supposed to choose from wtf");
			return;
		} else if (args.length == 1) {
			message.channel.send(`and? what's the other choice??`);
			return;
		}
		let choices = args.join(" ").split(" or ");
		let randomChoice = choices[Math.floor(Math.random() * choices.length)];
		if (randomChoice.trim() === "") return;
		message.channel.send(randomChoice);
	},
};
