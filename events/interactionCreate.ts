import { Client } from "discord.js";
import sendQuotes from "../helpers/general/sendQuotes";
import checkOsuURL from "../helpers/osu/url/checkOsuURL";
import commandHandler from "../helpers/core/commandHandler";
import addPrivateRoles from "../helpers/interactions/addPrivateRoles";
import sendVerificationLink from "../helpers/interactions/sendVerificationLink";
import osuInteractions from "../helpers/interactions/osuInteractions";
import slashCommandHandler from "../helpers/core/slashCommandHandler";

export default {
	name: "interactionCreate",
	execute(bot: Client) {
		bot.on("interactionCreate", async (interaction) => {
			addPrivateRoles(interaction);
			sendVerificationLink(interaction);

			if (interaction.isMessageContextMenu()) {
				interaction.deferReply({ ephemeral: true });
				osuInteractions(interaction);
			}

			if (interaction.isCommand()) {
				slashCommandHandler(bot, interaction);
			}
		});
	},
};
