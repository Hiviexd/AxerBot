import {
    AutocompleteInteraction,
    ButtonInteraction,
    ChatInputCommandInteraction,
    Interaction,
    StringSelectMenuInteraction,
} from "discord.js";
import { EventManager } from "./EventManager";
import { helpAutocomplete } from "../helpers/commands/helpAutocomplete";
import sendStaticVerificationLink from "../helpers/interactions/sendStaticVerificationLink";
import sendVerificationLink from "../helpers/interactions/sendVerificationLink";
import beatmapDownloader from "../modules/downloader/beatmapDownloader";
import { handleSelectRoles } from "../modules/selectroles/handleSelectRoles";
import { handleBnRulesButton } from "../modules/tracking/handleBnRulesButton";
import { handleSyncButton } from "../modules/verification/interactions/handleSyncButton";
import previewVerificationMessage from "../modules/verification/message/previewVerificationMessage";

export class InteractionManager {
    public readonly EventManager: EventManager;

    constructor(eventManager: EventManager) {
        this.EventManager = eventManager;
    }

    public handleInteraction(interaction: Interaction) {
        if (interaction instanceof ChatInputCommandInteraction)
            this.handleChatInputInteraction(interaction);

        if (interaction instanceof AutocompleteInteraction)
            this.handleAutocompleteInteraction(interaction);

        if (interaction instanceof ButtonInteraction) this.handleButtonInteraction(interaction);

        if (interaction instanceof StringSelectMenuInteraction)
            this.handleStringSelectMenuInteraction(interaction);
    }

    private handleStringSelectMenuInteraction(menu: StringSelectMenuInteraction) {
        // heardle(interaction);
    }

    private handleButtonInteraction(button: ButtonInteraction) {
        sendVerificationLink(button);
        sendStaticVerificationLink(button);
        beatmapDownloader(button);
        previewVerificationMessage(button);
        handleSelectRoles(button);
        handleSyncButton(button);
        handleBnRulesButton(button);
    }

    private handleAutocompleteInteraction(autocomplete: AutocompleteInteraction) {
        helpAutocomplete(autocomplete);
    }

    private handleChatInputInteraction(command: ChatInputCommandInteraction) {
        this.EventManager.CommandsManager.handleCommand(command);
    }
}
