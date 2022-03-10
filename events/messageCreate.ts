import { Client } from "discord.js";
import randomMessage from "../utils/messages/randomMessage";
import osuTimestamp from "../utils/messages/osuTimestamp";
import * as dotenv from "dotenv";
import * as database from "./../database";
// import osuURL from "../utils/messages/osuURLmanager";
dotenv.config();
const privserver: any = process.env.PRIVATESERVER;
const privlist: any = process.env.PRIVATELIST;

export default {
	name: "messageCreate",
	execute(bot: Client) {
		bot.on("messageCreate", async (message) => {
			if (message.author === bot.user) return;
			if (message.channel.type === "DM") return;
			const bot_user: any = bot.user;
			const guild_db = await database.guilds.findById(message.guildId);

			if (
				message.content.toUpperCase().includes("AXER") ||
				message.mentions.has(bot_user)
			) {
				if (!guild_db.fun.enable) return;

				if (guild_db.fun.mode == "default") {
					let source: string;
					let privateState: number;

					if (message.guildId === privserver) {
						source = privlist;
						privateState = 1;
					} else {
						source = "./data/axer.txt";
						privateState = 0;
					}
					randomMessage(source, privateState).then((randomQuote) => {
						message.channel.send(randomQuote);
					});
				} else {
					if (!guild_db.fun.enable) return;

					const random_quote = message.channel.messages.cache
						.filter(
							(q) =>
								q.author.id != bot_user.id &&
								!q.content.toUpperCase().includes("AXER") &&
								q.mentions.users.size == 0 &&
								!q.content.startsWith("!") &&
								!q.content.startsWith(guild_db.prefix)
						)
						.random();

					if (!random_quote) return;

					message.channel.send(random_quote.content);
				}
				// osuURL(message);
			} else {
				return osuTimestamp(message);
			}
		});
	},
};
