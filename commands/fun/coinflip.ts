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
		message.channel.send(`**${message.author.username}**'s coin landed on **${(coin === 0)? "Heads" : "Tails"}**!`);
	},
};
