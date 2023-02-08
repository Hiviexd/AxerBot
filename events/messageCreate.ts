import { Client } from "discord.js";
import sendQuotes from "../helpers/general/sendQuotes";
import checkOsuURL from "../helpers/osu/url/checkOsuURL";
import commandHandler from "../helpers/core/commandHandler";
import checkModhubURL from "../helpers/modhub/url/checkModhubURL";
import { checkOsuAttachment } from "../helpers/osu/file/checkOsuAttachment";
// import osuURL from "../utils/messages/osuURLmanager";

export default {
	name: "messageCreate",
	execute(bot: Client) {
		bot.on("messageCreate", async (message) => {
			if (message.author === bot.user) return;
			if (message.channel.type === "DM") return;
			if (!message.guild) return;

			const validChannelTypes = [
				"GUILD_TEXT",
				"GUILD_NEWS",
				"GUILD_VOICE",
			];

			if (!validChannelTypes.includes(message.channel.type)) return;

			const botAsMember = message.guild.members.cache.get(
				bot.user?.id || ""
			);

			if (!botAsMember) return;
			if (!botAsMember.permissions.has("SEND_MESSAGES")) return;

			if (
				!message.channel
					.permissionsFor(botAsMember, true)
					.has("SEND_MESSAGES") ||
				(!getPermissionForRoles() &&
					!message.channel
						.permissionsFor(botAsMember, true)
						.has("SEND_MESSAGES"))
			)
				return;

			function getPermissionForRoles() {
				if (!botAsMember) return false;
				let canSendMessages = false;

				botAsMember.roles.cache.forEach((r) => {
					if (r.permissions.has("SendMessages") == true)
						canSendMessages = true;
				});

				return canSendMessages;
			}

			commandHandler(bot, message);
			sendQuotes(message, bot);
			checkOsuURL(message);
			checkModhubURL(message);
			// checkOsuAttachment(message); disabled cuz my brain sucks
		});
	},
};
