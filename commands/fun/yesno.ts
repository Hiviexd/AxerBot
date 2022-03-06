import { Client, Message } from "discord.js";
import processFile from "../../utils/messages/randomMessage";
export default {
	name: "yesno",
	run: (bot: Client, message: Message, args: string[]) => {
		if (args.length < 1) {
			message.channel.send("waht is your question you dumbass");
			return;
		}
		processFile("./data/yesno.txt").then(function (data) {
			let quotes = data;
			let randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
			message.channel.send(randomQuote);
		});
	},
};
