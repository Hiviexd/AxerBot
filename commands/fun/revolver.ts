import { Client, CommandInteraction } from "discord.js";
import { numberToEmoji } from "../../helpers/text/numberToEmoji";
import * as database from "./../../database";

export default {
	name: "revolver",
	help: {
		description: "Russian Roulette, but with bigger numbers!",
		syntax: "/revolver",
	},
	interaction: true,
	config: {
		type: 1,
	},
	category: "fun",
	run: async (bot: Client, command: CommandInteraction, args: string[]) => {
		await command.deferReply();

		const guild = await database.guilds.findOne({ _id: command.guildId });
		if (!guild) return;

		let revolver = Math.floor(Math.random() * 6) + 1;

		if (revolver === 1) {
			guild.fun.revolver = 0;
			await database.guilds.findByIdAndUpdate(command.guildId, {
				fun: guild.fun,
			});
			command.editReply(`💥 🔫`);
		} else {
			guild.fun.revolver++;
			await database.guilds.findByIdAndUpdate(command.guildId, {
				fun: guild.fun,
			});
			command.editReply(`${numberToEmoji(guild.fun.revolver)} 🔫`);
		}
	},
};
