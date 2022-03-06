import { Client, Message } from "discord.js";
import processFile from "../utils/messages/randomMessage";

export default {
	name: "messageCreate",
	execute(bot: Client) {
		bot.on("messageCreate", (message) => {
			//Check if author is a bot or the message was sent in dms and return
			if (message.author === bot.user) return;
			if (message.channel.type === "DM") return;
			const bot_user: any = bot.user;

			//toUpperCase makes the keyword case insensitive
			if (
				message.content.toUpperCase().includes("AXER") ||
				message.mentions.has(bot_user)
			) {
				processFile("./data/axer.txt").then(function (data) {
					let quotes = data;
					let randomQuote =
						quotes[Math.floor(Math.random() * quotes.length)];
					message.channel.send(randomQuote);
				});
			}
		});
	},
};
