import {
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
    GuildMember,
    ApplicationCommandType,
} from "discord.js";
import { randomUUID } from "crypto";
import {
    ContextMenuCommand,
    ContextMenuType,
} from "../../../models/commands/ContextMenuCommand";
import { SendReportEmbed } from "../../../responses/report/SendReportEmbed";

export default new ContextMenuCommand<ContextMenuType.Message>()
    .setName("Report Message")
    .setType(ApplicationCommandType.Message)
    .setEphemeral(true)
    .setModal(true)
    .setExecuteFunction(async (command) => {
        const modal = new ModalBuilder()
            .setTitle("Report Message")
            .setCustomId(randomUUID());
        const reasonField =
            new ActionRowBuilder<TextInputBuilder>().setComponents(
                new TextInputBuilder()
                    .setLabel("Reason")
                    .setRequired(true)
                    .setCustomId("reason")
                    .setStyle(TextInputStyle.Paragraph)
            );

        modal.addComponents(reasonField);

        await command.showModal(modal);

        const modalContent = await command.awaitModalSubmit({
            time: 300000, // 5 minutes,
        });

        await modalContent.deferUpdate();

        const reportReason = modalContent.fields.getTextInputValue("reason");

        if (!command.targetMessage.member || !command.member) return;

        SendReportEmbed({
            command,
            reason: reportReason,
            reportedUser: command.targetMessage.member,
            reporter: command.member as GuildMember,
            messageContent: command.targetMessage.content,
        });
    });
