import { Client } from "discord.js";
import createNewGuild from "../database/utils/createNewGuild";

export default {
	name: "guildCreate",
	execute(bot: Client) {
		bot.on("guildCreate", async (guild) => {
			createNewGuild(guild);
		});
	},
};
