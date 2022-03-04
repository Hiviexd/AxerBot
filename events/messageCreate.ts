import { Client, Message } from "discord.js";

import fs from "fs";
import readline from "readline";

async function processFile() {
	const fileStream = fs.createReadStream("./data/axer.txt");
	const returnArray = [];
	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity,
	});
	// Note: crlfDelay is to recognize all instances of CR LF
	// ('\r\n') in the .txt as a single line break.

	for await (const line of rl) {
		// Each line in the .txt will be successively available here as `line`.
		//TODO: fetch lines as template literals instead of strings with quotes
		returnArray.push(line);
	}

	return returnArray;
}

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
				processFile().then(function (data) {
					let quotes = data;
					let randomQuote =
						quotes[Math.floor(Math.random() * quotes.length)];
					message.channel.send(randomQuote);
				});
			}
		});
	},
};
