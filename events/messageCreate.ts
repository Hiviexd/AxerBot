import { Client } from "discord.js";
import osuTimestamp from "../helpers/text/osuTimestamp";
import sendQuotes from "../helpers/general/sendQuotes";
import checkOsuURL from "../helpers/osu/url/checkOsuURL";
// import osuURL from "../utils/messages/osuURLmanager";

export default {
	name: "messageCreate",
	execute(bot: Client) {
		bot.on("messageCreate", async (message) => {
			if (message.author === bot.user) return;
			if (message.channel.type === "DM") return;
			if (!message.guild) return;

			sendQuotes(message, bot);
			osuTimestamp(message);
			checkOsuURL(message);
		});
	},
};
