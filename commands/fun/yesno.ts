import { Client, Message } from "discord.js";
import randomMessage from "../../utils/messages/randomMessage";
export default {
	name: "yesno",
	description: "Yes or no? I can help you decide!",
	syntax: "!yesno `option`",
	example: "!yesno `axer cringe?`",
	category: "fun",
	run: (bot: Client, message: Message, args: string[]) => {
		let source: string = "./data/yesno.txt";
        let privateState: number = 0;
		if (args.length < 1) {
			message.channel.send("waht is your question you dumbass");
			return;
		}
		randomMessage(source, privateState).then((randomQuote) => {
			message.channel.send(randomQuote);
		});
	},
};
