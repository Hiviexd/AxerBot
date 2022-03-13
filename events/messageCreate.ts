import { Client, Collection } from "discord.js";
import randomMessage from "../utils/messages/randomMessage";
import osuTimestamp from "../utils/messages/osuTimestamp";
import * as dotenv from "dotenv";
import * as database from "./../database";
import createNewGuild from "../database/utils/createNewGuild";
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
			if (!message.guild) return;
			const bot_user: any = bot.user;
			let guild_db = await database.guilds.findById(message.guildId);

			if (guild_db == null) await createNewGuild(message.guild);
			guild_db = await database.guilds.findById(message.guildId);

			if (
				guild_db.fun.enable == true &&
				guild_db.fun.cooldown.ends_at != 0
			) {
				if (new Date() > new Date(guild_db.fun.cooldown.ends_at)) {
					const g = await database.guilds.findOne({
						_id: message.guildId,
					});

					g.fun.cooldown = {
						active: false,
						ends_at: 0,
					};

					await database.guilds.findOneAndUpdate(
						{ _id: message.guildId },
						{
							fun: g.fun,
						}
					);
				}
			}

			if (guild_db.fun.enable == true && guild_db.fun.mode != "default") {
				if (
					guild_db.fun.phrases.length < 500 &&
					!guild_db.fun.cooldown.active
				) {
					const new_quote = message.channel.messages.cache
						.filter(
							(q) =>
								q.author.id != bot_user.id &&
								!q.content.toUpperCase().includes("AXER") &&
								q.mentions.users.size == 0 &&
								!q.content.startsWith("!") &&
								!q.content.startsWith(guild_db.prefix) &&
								q.content.trim() != ""
						)
						.random();

					if (new_quote) {
						guild_db.fun.phrases.push({
							id: new_quote.id,
							channel: new_quote.channelId,
							guild: new_quote.guildId,
							content: new_quote.content,
						});

						guild_db.fun.cooldown = {
							active: true,
							ends_at: calcCooldown(),
						};

						await database.guilds.findOneAndUpdate(
							{ _id: message.guildId },
							{
								fun: guild_db.fun,
							}
						);

						function calcCooldown() {
							const now = new Date();
							let cooldown = new Date(now);
							cooldown.setSeconds(cooldown.getSeconds() + 25);

							return cooldown;
						}
					}
				}
			}

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

					guild_db = await database.guilds.findById(message.guildId);
					const quote =
						guild_db.fun.phrases[
							Math.floor(
								Math.random() * guild_db.fun.phrases.length
							)
						];

					message.channel.send(quote.content);
				}
				// osuURL(message);
			} else {
				return osuTimestamp(message);
			}
		});
	},
};
