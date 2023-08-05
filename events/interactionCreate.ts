import { ApplicationCommandType, Client, ComponentType, InteractionType } from "discord.js";
import { helpAutocomplete } from "../helpers/commands/helpAutocomplete";
import slashCommandHandler from "../helpers/core/slashCommandHandler";
import sendVerificationLink from "../helpers/interactions/sendVerificationLink";
import beatmapDownloader from "../modules/downloader/beatmapDownloader";
import heardle from "../modules/heardle/heardle";
import previewVerificationMessage from "../modules/verification/message/previewVerificationMessage";
import { handleSelectRoles } from "../modules/selectroles/handleSelectRoles";
import { handleSyncButton } from "../modules/verification/interactions/handleSyncButton";
import sendStaticVerificationLink from "../helpers/interactions/sendStaticVerificationLink";
import { handleBnRulesButton } from "../modules/tracking/handleBnRulesButton";

export default {
    name: "interactionCreate",
    execute(bot: Client) {
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

                    handleBnRulesButton(interaction);
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
