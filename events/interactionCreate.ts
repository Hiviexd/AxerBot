import { ApplicationCommandType, ComponentType, InteractionType } from "discord.js";

import { helpAutocomplete } from "../helpers/commands/helpAutocomplete";
import slashCommandHandler from "../helpers/core/slashCommandHandler";
import sendStaticVerificationLink from "../helpers/interactions/sendStaticVerificationLink";
import sendVerificationLink from "../helpers/interactions/sendVerificationLink";
import { AxerBot } from "../models/core/AxerBot";
import beatmapDownloader from "../modules/downloader/beatmapDownloader";
import heardle from "../modules/heardle/heardle";
import { handleSelectRoles } from "../modules/selectroles/handleSelectRoles";
import { handleSyncButton } from "../modules/verification/interactions/handleSyncButton";
import previewVerificationMessage from "../modules/verification/message/previewVerificationMessage";

export default {
    name: "interactionCreate",
    execute(bot: AxerBot) {
        bot.on("interactionCreate", async (interaction) => {
            // ============ Autocomplete
            if (interaction.type == InteractionType.ApplicationCommandAutocomplete) {
                helpAutocomplete(interaction);
                return;
            }

            if (interaction.type == InteractionType.MessageComponent) {
                // ============ Buttons
                if (interaction.componentType == ComponentType.Button) {
                    sendVerificationLink(interaction);
                    sendStaticVerificationLink(interaction);

                    beatmapDownloader(interaction);

                    previewVerificationMessage(interaction);

                    handleSelectRoles(interaction);

                    handleSyncButton(interaction);
                }

                // ============ String Select Menu
                if (interaction.componentType == ComponentType.StringSelect) {
                    heardle(interaction);
                }
            }

            if (interaction.type == InteractionType.ApplicationCommand) {
                // ============ Chat input
                if (
                    [
                        ApplicationCommandType.ChatInput,
                        ApplicationCommandType.Message,
                        ApplicationCommandType.User,
                    ].includes(interaction.commandType)
                ) {
                    slashCommandHandler(bot, interaction);
                }
            }
        });
    },
};
