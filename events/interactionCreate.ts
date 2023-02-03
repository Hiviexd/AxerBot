import { ButtonInteraction, Client } from "discord.js";
import sendQuotes from "../helpers/general/sendQuotes";
import checkOsuURL from "../helpers/osu/url/checkOsuURL";
import commandHandler from "../helpers/core/commandHandler";
import addPrivateRoles from "../helpers/interactions/addPrivateRoles";
import sendVerificationLink from "../helpers/interactions/sendVerificationLink";
import osuInteractions from "../helpers/interactions/osuInteractions";
import slashCommandHandler from "../helpers/core/slashCommandHandler";
import heardle from "../modules/heardle/heardle";
import beatmapDownloader from "../modules/downloader/beatmapDownloader";
import previewVerificationMessage from "../modules/verification/message/previewVerificationMessage";

export default {
	name: "interactionCreate",
	execute(bot: Client) {
		bot.on("interactionCreate", async (interaction) => {
			addPrivateRoles(interaction);

			if (
				(interaction as ButtonInteraction).customId &&
				(interaction as ButtonInteraction).customId.includes(
					"handlerIgnore"
				)
			)
				return;

			if (interaction.isButton()) {
				if (!interaction.customId.includes("beatmap_download")) {
					await interaction.deferReply({ ephemeral: true });
					sendVerificationLink(interaction);
				}

				if (interaction.customId.includes("beatmap_download")) {
					beatmapDownloader(interaction);
				}

				if (
					interaction.customId.includes("verificationpreviewmessage")
				) {
					previewVerificationMessage(interaction);
				}
			}

			if (interaction.isMessageContextMenu()) {
				await interaction.deferReply({ ephemeral: true });
				osuInteractions(interaction);
			}

			if (interaction.isCommand()) {
				slashCommandHandler(bot, interaction);
			}

			if (interaction.isSelectMenu()) {
				if (interaction.customId.split("|")[0] == "heardle") {
					heardle(interaction);
				}
			}
		});
	},
};
