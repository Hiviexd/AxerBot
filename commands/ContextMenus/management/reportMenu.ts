import {
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
    GuildMember,
    ApplicationCommandType,
} from "discord.js";
import {
    ContextMenuCommand,
    ContextMenuType,
} from "../../../models/commands/ContextMenuCommand";

export default new ContextMenuCommand<ContextMenuType.Message>()
    .setName("Report Message")
    .setType(ApplicationCommandType.Message)
    .setEphemeral(true)
    .setModal(true)
    .setExecuteFunction(async (command) => {
        const targetAudio = command.targetMessage.attachments.find(
            (a) => a.contentType
        );
    });
