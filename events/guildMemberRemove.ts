import { Client } from "discord.js";
import { consoleLog } from "../helpers/core/logger";
import logServerLeaves from "../modules/loggers/logServerLeaves";

export default {
	name: "guildMemberRemove",
	execute(bot: Client) {
		try {
			bot.on("guildMemberRemove", async (member) => {
				const bot_user: any = bot.user;

				if (member.id == bot_user.id) return;

				if (!member.user) return;
				
				await logServerLeaves(member);

				consoleLog(
					"guildMemberRemove",
					`User ${member.user.tag} has left the server ${member.guild.name}!`
				);
			});
		} catch (e: any) {
			console.error(e);
		}
	},
};
