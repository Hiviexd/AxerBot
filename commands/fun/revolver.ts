import { Client, Message } from "discord.js";
import { numberToEmoji } from "../../helpers/text/numberToEmoji";
import * as database from "./../../database";

export default {
	name: "revolver",
	help: {
		description: "Russian Roulette, but with bigger numbers!",
		syntax: "{prefix}revolver",

	},
	category: "fun",
	run: async (bot: Client, message: Message, args: string[]) => {

		const guild = await database.guilds.findOne({ _id: message.guildId });
		if (!guild) return;

		let revolver = Math.floor(Math.random() * 6) + 1;

		if (revolver === 1) {
			guild.fun.revolver = 0;
			await database.guilds.findByIdAndUpdate(
				message.guildId ,
				{ fun: guild.fun } 
			);
			message.channel.send("💥 🔫");
		} else {
			guild.fun.revolver++;
			await database.guilds.findByIdAndUpdate(
				message.guildId ,
				{ fun: guild.fun } 
			);
			message.channel.send(`${numberToEmoji(guild.fun.revolver)} 🔫`);
		}
	},
};
