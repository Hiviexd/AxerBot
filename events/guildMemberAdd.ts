import { Client, GuildMember } from "discord.js";

import { consoleLog } from "../utils/core/logger";

export default {
	name: "guildMemberAdd",
	execute(bot: Client) {
		bot.on("guildMemberAdd", (member) => {
			//Log the newly joined member to console
			consoleLog(
				"guildMemberAdd",
				`User ${member.user.tag} has joined the server!`
			);

			//Find a channel named welcome and send a Welcome message

			const channel: any = member.guild.channels.cache.find(
				(c) => c.name === "arrival"
			);

			if (!channel) return;
			if (channel.type != "GUILD_TEXT") return;

			channel.send(
				`Welcome, <@${member.user.id}>! Please link your osu! profile, and tell us your favorite FA in order to get access to the channels!`
			);
		});
	},
};
