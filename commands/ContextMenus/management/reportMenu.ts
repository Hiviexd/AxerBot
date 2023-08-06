import {
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
    GuildMember,
    ApplicationCommandType,
    InteractionCollector,
    ComponentType,
    InteractionType,
    ModalSubmitInteraction,
} from "discord.js";
import { randomUUID } from "crypto";
import { ContextMenuCommand, ContextMenuType } from "../../../models/commands/ContextMenuCommand";
import { SendReportEmbed } from "../../../responses/report/SendReportEmbed";
import generateErrorEmbed from "../../../helpers/text/embeds/generateErrorEmbed";

export default new ContextMenuCommand<ContextMenuType.Message>()
    .setName("Report Message")
    .setType(ApplicationCommandType.Message)
    .setEphemeral(true)
    .setModal(true)
    .setExecuteFunction(async (command) => {
        try {
            const modal = new ModalBuilder().setTitle("Report Message").setCustomId(randomUUID());
            const reasonField = new ActionRowBuilder<TextInputBuilder>().setComponents(
                new TextInputBuilder()
                    .setLabel("Reason")
                    .setRequired(true)
                    .setCustomId("reason")
                    .setStyle(TextInputStyle.Paragraph)
            );

            modal.addComponents(reasonField);

            await command.showModal(modal);

            const collector = new InteractionCollector(command.client, {
                time: 300000, // 5 minutes,
                filter: (i) => i.user.id == command.user.id && i.customId == modal.data.custom_id,
            });

            collector
                .on("collect", async (modalData: ModalSubmitInteraction) => {
                    await modalData.deferUpdate();

                    const reportReason = modalData.fields.getTextInputValue("reason");

                    const reportedMessageAuthor = command.targetMessage.author;
                    const reportedMember = await command.guild?.members.fetch(
                        reportedMessageAuthor.id
                    );

                    if (!reportedMember || !command.member)
                        return console.log("no user", reportedMember, command.member);

                    SendReportEmbed({
                        command,
                        reason: reportReason,
                        reportedUser: reportedMember,
                        reporter: command.member as GuildMember,
                        messageContent: command.targetMessage.content,
                    });

                    collector.stop("end");
                })
                .on("end", (reason: string) => {
                    if (reason != "end") {
                        console.log(reason);

                        command.followUp({
                            embeds: [generateErrorEmbed("Something went wrong!")],
                            ephemeral: true,
                        });

                        return;
                    }

                    command.followUp({
                        embeds: [generateErrorEmbed("Time Out! Don't leave me waiting.")],
                        ephemeral: true,
                    });
                });
        } catch (e) {
            console.error(e);

            command.followUp({
                embeds: [generateErrorEmbed("Something went wrong!")],
                ephemeral: true,
            });
        }
    });
