import { Client } from "discord.js";
import sendQuotes from "../helpers/general/sendQuotes";
import checkOsuURL from "../helpers/osu/url/checkOsuURL";
import commandHandler from "../helpers/core/commandHandler";
// import osuURL from "../utils/messages/osuURLmanager";

export default {
	name: "messageCreate",
	execute(bot: Client) {
		bot.on("messageCreate", async (message) => {
			if (message.author === bot.user) return;
			if (message.channel.type === "DM") return;
			if (!message.guild) return;
			
			const botAsMember = message.guild.members.cache.get(bot.user?.id || "");

			if (!botAsMember) return;
			if (!botAsMember.permissions.has("SEND_MESSAGES")) return;

			if (!message.channel.permissionsFor(botAsMember, true).has("SEND_MESSAGES") || (!getPermissionForRoles() && !message.channel.permissionsFor(botAsMember, true).has("SEND_MESSAGES"))) return;

			function getPermissionForRoles() {
				if (!botAsMember) return false;
				let canSendMessages = false;

				botAsMember.roles.cache.forEach((r) => {
					if (r.permissions.has("SEND_MESSAGES") == true) canSendMessages = true;
				})

				return canSendMessages;
			}

			commandHandler(bot, message);
			sendQuotes(message, bot);
			checkOsuURL(message);
		});
	},
};
