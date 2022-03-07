import { Client } from "discord.js";
import randomMessage from "../utils/messages/randomMessage";
import osuTimestamp from "../utils/messages/osuTimestamp";
import * as dotenv from "dotenv";
dotenv.config();
const privserver: any = process.env.PRIVATESERVER;
const privlist: any = process.env.PRIVATELIST;

export default {
	name: "messageCreate",
	execute(bot: Client) {
		bot.on("messageCreate", (message) => {
			//Check if author is a bot or the message was sent in dms and return
			if (message.author === bot.user) return;
			if (message.channel.type === "DM") return;

			const bot_user: any = bot.user;
            let source: string;
            let privateState: number;
            //check if keyword or bot are mentioned
			if (message.content.toUpperCase().includes("AXER") || message.mentions.has(bot_user)) {
				//check if server uses private list
                //if (bot.guilds.cache.filter(s => s.id === privserver).size > 0)
                if (message.guildId === privserver) {
                    source = privlist;
                    privateState = 1;
                } else {
                    source = "./data/axer.txt";
                    privateState = 0;
                }
                console.log("privserver: " + privserver);
                console.log("privlist: " + privlist);
                console.log("source: " + source);
                console.log("privateState: " + privateState);
                randomMessage(source, privateState).then((randomQuote) => {
                    message.channel.send(randomQuote);
                });
            }
			osuTimestamp(message);
		});
	},
};
