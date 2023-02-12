import {
    Message,
    ChatInputCommandInteraction,
    TextInputComponent,
    ModalActionRowComponent,
    PermissionFlagsBits,
    TextInputBuilder,
    ModalBuilder,
    TextInputStyle,
    ActionRowBuilder,
    UserSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
} from "discord.js";
import MissingPermissions from "../../../../responses/embeds/MissingPermissions";
import { guilds } from "../../../../database";
import { ownerId } from "../../../../config.json";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import crypto from "crypto";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const verificationSetMessage = new SlashCommandSubcommand(
    "message",
    "Set the message that will be sent on the system channel (will open a popup that takes text input)",
    false,
    {
        syntax: "/verification `set message`",
        placeholders: "`{member}` - a ping of the member that will be verified",
        "example message": "Hello {member} and welcome to this server!",
    },
    [PermissionFlagsBits.ManageGuild]
);

verificationSetMessage.setExecuteFunction(async (command) => {
    if (!command.member) return;

    let guild = await guilds.findById(command.guildId);
    if (!guild)
        return command.editReply(
            "This guild isn't validated, try again after some seconds.."
        );

    const modalId = crypto.randomBytes(15).toString("hex").slice(10);
    const modal = new ModalBuilder()
        .setTitle("Verification welcome message")
        .setCustomId(modalId);

    const textInput = new TextInputBuilder()
        .setLabel("Message")
        .setStyle(TextInputStyle.Paragraph)
        .setValue(guild.verification.message)
        .setCustomId("newWelcomeMessage");

    const firstTextInput =
        new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);

    modal.addComponents(firstTextInput);

    await command.showModal(modal);

    command.client.on(
        "interactionCreate",
        async (interaction): Promise<any> => {
            if (!interaction.isModalSubmit()) return;
            if (interaction.customId != modalId) return;

            await interaction.deferReply();
            const message =
                interaction.fields.getTextInputValue("newWelcomeMessage");

            let guild = await guilds.findById(command.guildId);
            if (!guild)
                return interaction.editReply(
                    "This guild isn't validated, try again after some seconds.."
                );

            guild.verification.message = message;

            await guilds.findByIdAndUpdate(command.guildId, guild);

            const previewButton = new ButtonBuilder()
                .setLabel("Preview message")
                .setStyle(ButtonStyle.Primary)
                .setCustomId(
                    `verificationpreviewmessage|${interaction.user.id}`
                );

            const previewButtonActionRow =
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    previewButton
                );

            interaction.editReply({
                embeds: [generateSuccessEmbed("Message changed!")],
                components: [previewButtonActionRow],
            });
        }
    );
});

export default verificationSetMessage;
