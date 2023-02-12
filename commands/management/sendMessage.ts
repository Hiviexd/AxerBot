import {
    ModalBuilder,
    InteractionCollector,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    PermissionFlagsBits,
} from "discord.js";
import generateSuccessEmbed from "../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import crypto from "crypto";
import { SlashCommand } from "../../models/commands/SlashCommand";

const sendmessage = new SlashCommand(
    "sendmessage",
    "Sends a message to a specified channel",
    "Management",
    false,
    {
        description: "Sends a message to a specified channel",
        syntax: "/sendmessage `<channel>`",
        example: "/sendmessage `#general`",
    },
    [PermissionFlagsBits.ManageMessages]
);

sendmessage.builder.addChannelOption((o) =>
    o
        .setName("channel")
        .setDescription("Channel to send the message")
        .setRequired(true)
);

sendmessage.setExecuteFunction(async (command) => {
    if (!command.guild) return;

    const channel = command.options.getChannel("channel", true);

    if (!command.channel || !command.channel.isTextBased()) return;

    const guild_channel = await command.guild.channels.fetch(channel.id);

    const modalId = crypto.randomBytes(15).toString("hex").slice(10);
    const modal = new ModalBuilder()
        .setTitle("Send message")
        .setCustomId(modalId);

    const textInput = new TextInputBuilder()
        .setCustomId("send-message-text-input")
        .setStyle(TextInputStyle.Paragraph)
        .setLabel("Message")
        .setRequired(true);

    const firstTextInput =
        new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);

    modal.addComponents(firstTextInput);
    await command.showModal(modal);

    const collector = new InteractionCollector(command.client, {
        time: 120000,
        filter: (interaction) => interaction.user.id == command.user.id,
    });

    collector.on("collect", async (interaction): Promise<any> => {
        if (!interaction.isModalSubmit()) return;
        !interaction.deferred
            ? await interaction.deferReply({ ephemeral: true })
            : void {};

        if (
            interaction.customId === modalId &&
            guild_channel &&
            guild_channel.isTextBased()
        ) {
            const message = interaction.fields.getTextInputValue(
                "send-message-text-input"
            );

            if (!message) return;
            await guild_channel.send(message).then(() => {
                interaction.followUp({
                    embeds: [
                        generateSuccessEmbed("✅ Message sent successfully."),
                    ],
                    ephemeral: true,
                });
            });
        } else {
            interaction.followUp({
                embeds: [
                    generateErrorEmbed(
                        "❗ Please specify a valid text channel."
                    ),
                ],
                ephemeral: true,
            });
        }

        collector.stop();
    });
});

export default sendmessage;
