import { randomBytes } from "crypto";
import colors from "../../../../constants/colors";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import {
    PermissionFlagsBits,
    TextInputBuilder,
    ActionRowBuilder,
    TextInputStyle,
    ModalBuilder,
    EmbedBuilder,
    ColorResolvable,
    RoleSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    ChannelType,
    TextBasedChannel,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
} from "discord.js";
import { generateStepEmbedWithChoices } from "../../../../helpers/commands/generateStepEmbedWithChoices";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import { selectRoles } from "../../../../database";

const createRoleSelector = new SlashCommandSubcommand(
    "new",
    "Create a new select menu",
    undefined,
    [PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.ManageRoles],
    true
);

createRoleSelector.setExecuteFunction(async (command) => {
    // Text inputs
    const modalEmbedTitleInput =
        new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
                .setLabel("Embed Title")
                .setStyle(TextInputStyle.Short)
                .setValue("Select your roles")
                .setCustomId("title")
                .setPlaceholder("(optional)")
        );

    const modalEmbedDescriptionInput =
        new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
                .setLabel("Embed Content")
                .setStyle(TextInputStyle.Paragraph)
                .setValue("- @cool users: is for cool users")
                .setRequired(true)
                .setCustomId("description")
        );

    const modalEmbedColorInput =
        new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
                .setLabel("Embed Color")
                .setStyle(TextInputStyle.Short)
                .setValue(colors.pink as string)
                .setCustomId("color")
                .setRequired(false)
                .setPlaceholder("HEX format (optional)")
        );

    // Image inputs
    const modalEmbedImageInput =
        new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
                .setLabel("Embed Image")
                .setStyle(TextInputStyle.Short)
                .setCustomId("image")
                .setRequired(false)
                .setPlaceholder("URL (optional)")
        );

    const modalEmbedThumbnailInput =
        new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
                .setLabel("Embed Thumbnail")
                .setStyle(TextInputStyle.Short)
                .setCustomId("thumbnail")
                .setRequired(false)
                .setPlaceholder("URL (optional)")
        );

    const embedInfoModalHandshakeInteractionId =
        randomBytes(10).toString("hex");
    const embedInfoModal = new ModalBuilder()
        .setTitle("New Role Selector")
        .setCustomId(embedInfoModalHandshakeInteractionId)
        .setComponents(
            modalEmbedTitleInput,
            modalEmbedDescriptionInput,
            modalEmbedColorInput,
            modalEmbedThumbnailInput,
            modalEmbedImageInput
        );

    await command.showModal(embedInfoModal);

    const embedInfoModalResponse = await command.awaitModalSubmit({
        time: 300000, // 5 minutes,
    });
    embedInfoModalResponse.deferUpdate();

    const embedTitle = embedInfoModalResponse.fields.getTextInputValue("title");
    const embedDescription =
        embedInfoModalResponse.fields.getTextInputValue("description");
    const embedColor = embedInfoModalResponse.fields.getTextInputValue("color");
    const embedThumbnail =
        embedInfoModalResponse.fields.getTextInputValue("thumbnail");
    const embedImage = embedInfoModalResponse.fields.getTextInputValue("image");

    const embedData = new EmbedBuilder()
        .setTitle(embedTitle)
        .setDescription(embedDescription);

    // Check if the input is a valid hex color input
    const hexValueRegExp = /^#([0-9a-f]{3}){1,2}$/i;

    if (embedColor) {
        if (hexValueRegExp.test(embedColor.toUpperCase()))
            embedData.setColor(embedColor.toUpperCase() as ColorResolvable);
    }

    // Check if the input is has a valid url
    if (embedThumbnail) {
        try {
            embedData.setThumbnail(new URL(embedThumbnail).href);
        } catch (error) {
            void {}; // Just ignore
        }
    }

    if (embedImage) {
        try {
            embedData.setThumbnail(new URL(embedImage).href);
        } catch (error) {
            void {}; // Just ignore
        }
    }

    requestRolesInput();

    const entryData = {
        roles: [] as string[],
        channel: command.channelId,
        embed: embedData,
    };

    function requestRolesInput() {
        const selectMenu = new RoleSelectMenuBuilder()
            .setMaxValues(25)
            .setMinValues(1);

        generateStepEmbedWithChoices(
            command,
            "Roles to display",
            "You can select up to 25 roles",
            selectMenu,
            undefined,
            false,
            true
        )
            .then((roles) => {
                const roleIds = roles.data;

                entryData.roles = roleIds;

                requestChannel();
            })
            .catch((error) => {
                console.log(error);
                command.followUp({
                    embeds: [generateErrorEmbed("Time out!")],
                });
            });
    }

    function requestChannel() {
        const selectMenu = new ChannelSelectMenuBuilder()
            .setMaxValues(1)
            .setMinValues(1)
            .setChannelTypes(
                ChannelType.GuildText,
                ChannelType.GuildAnnouncement,
                ChannelType.GuildForum
            );

        generateStepEmbedWithChoices(
            command,
            "Channel to send the message",
            "Up to 1 channel",
            selectMenu,
            undefined,
            false,
            true
        )
            .then((channel) => {
                const channelId = channel.data[0];

                entryData.channel = channelId;

                sendData();
            })
            .catch((error) => {
                console.log(error);
                command.followUp({
                    embeds: [generateErrorEmbed("Time out!")],
                });
            });
    }

    async function sendData() {
        const channel = command.guild?.channels.cache.get(entryData.channel) as
            | TextBasedChannel
            | undefined;

        if (
            !channel ||
            ![
                ChannelType.GuildText,
                ChannelType.GuildAnnouncement,
                ChannelType.GuildForum,
            ].includes(channel.type)
        )
            return command.followUp({
                embeds: [generateErrorEmbed("Invalid channel!")],
            });

        channel
            .send({
                embeds: [embedData],
                components: [
                    new ActionRowBuilder<ButtonBuilder>().setComponents(
                        new ButtonBuilder()
                            .setLabel("Select Roles")
                            .setStyle(ButtonStyle.Secondary)
                            .setCustomId(
                                `${randomBytes(10).toString("hex")},selectroles`
                            )
                    ),
                ],
            })
            .then(async (message) => {
                await selectRoles.create({
                    _id: message.id,
                    guild_id: command.guildId,
                    channel: entryData.channel,
                    roles: entryData.roles,
                    embed: {
                        title: embedTitle,
                        description: embedDescription,
                        color: embedColor,
                        image: embedImage,
                        thumbnail: embedThumbnail,
                    },
                });

                command.followUp({
                    embeds: [
                        generateSuccessEmbed(
                            "Message sent! Use `/selectroles edit` to edit it."
                        ),
                    ],
                });
            });
    }
});

export default createRoleSelector;
