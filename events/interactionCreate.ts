import { ButtonInteraction, Client } from "discord.js";
import { helpAutocomplete } from "../helpers/commands/helpAutocomplete";
import slashCommandHandler from "../helpers/core/slashCommandHandler";
import sendVerificationLink from "../helpers/interactions/sendVerificationLink";
import beatmapDownloader from "../modules/downloader/beatmapDownloader";
import heardle from "../modules/heardle/heardle";
import previewVerificationMessage from "../modules/verification/message/previewVerificationMessage";

export default {
    name: "interactionCreate",
    execute(bot: Client) {
        bot.on("interactionCreate", async (interaction) => {
            //addPrivateRoles(interaction);

            if (interaction.isAutocomplete()) {
                helpAutocomplete(interaction);
                return;
            }

            if (interaction.isButton()) {
                sendVerificationLink(interaction);

                if (interaction.customId.includes("beatmap_download")) {
                    beatmapDownloader(interaction);
                }

                if (
                    interaction.customId.includes("verificationpreviewmessage")
                ) {
                    previewVerificationMessage(interaction);
                }
            }

            if (interaction.isStringSelectMenu()) {
                heardle(interaction);
            }

            if (interaction.isChatInputCommand()) {
                slashCommandHandler(bot, interaction);
            }
        });
    },
};
