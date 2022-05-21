import { Client, Message } from "discord.js";

export default {
	name: "coinflip",
	help: {
		description: "Feeling lucky? Flip a coin!",
		syntax: "{prefix}coinflip",

	},
	category: "fun",
	run: (bot: Client, message: Message, args: string[]) => {
		let coin = Math.floor(Math.random() * 2);
		(coin === 0)? message.channel.send("Heads"): message.channel.send("Tails");
	},
};