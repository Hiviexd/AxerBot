import { Client } from "discord.js";
import osuTimestamp from "../utils/messages/osuTimestamp";
import randomMessage from "../utils/messages/randomMessage";
// import osuURL from "../utils/messages/osuURLmanager";

export default {
	name: "messageCreate",
	execute(bot: Client) {
		bot.on("messageCreate", async (message) => {
			if (message.author === bot.user) return;
			if (message.channel.type === "DM") return;
			if (!message.guild) return;

			randomMessage(message, bot)
			osuTimestamp(message);
		});
	},
};
