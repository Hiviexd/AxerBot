import { Client } from "discord.js";
import sendQuotes from "../helpers/general/sendQuotes";
import checkOsuURL from "../helpers/osu/url/checkOsuURL";
import commandHandler from "../helpers/core/commandHandler";
import addPrivateRoles from "../helpers/interactions/addPrivateRoles";

export default {
	name: "interactionCreate",
	execute(bot: Client) {
		bot.on("interactionCreate", async (interaction) => {
			addPrivateRoles(interaction);
		});
	},
};
