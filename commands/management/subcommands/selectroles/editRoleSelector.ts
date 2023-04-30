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
    ComponentType,
    APIEmbed,
} from "discord.js";
import { generateStepEmbedWithChoices } from "../../../../helpers/commands/generateStepEmbedWithChoices";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import { integerToHex } from "../../../../modules/bancho/helpers/integerToHex";

const editRoleSelector = new SlashCommandSubcommand(
    "edit",
    "Edit a select menu",
    undefined,
    [PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.ManageRoles],
    true
);

editRoleSelector.builder.addStringOption((o) =>
    o
        .setName("message_url")
        .setDescription("Message permalink")
        .setRequired(true)
);

function parseMessagePermalink(messageUrl: string) {
    try {
        const messageUrlParameters = new URL(messageUrl);
        if (!messageUrlParameters.hostname.endsWith("discord.com")) return null;

        const paths = messageUrlParameters.pathname.split("/").slice(1);

        if (paths.length != 4) return null;

        if (paths[0] != "channels") return null;

        if (
            isNaN(Number(paths[1])) ||
            isNaN(Number(paths[2])) ||
            isNaN(Number(paths[3]))
        )
            return null;

        return {
            guildId: paths[1],
            channelId: paths[2],
            messageId: paths[3],
        };
    } catch (e) {
        return null;
    }
}

editRoleSelector.setExecuteFunction(async (command) => {
    const messageUrl = command.options.getString("message_url", true);

    const messagePermalinkData = parseMessagePermalink(messageUrl);

    if (!messagePermalinkData)
        return command.reply({
            embeds: [generateErrorEmbed("Provide a valid message URL")],
        });

    const selectRolesMessageData = await getSelectRolesData();
    if (!selectRolesMessageData)
        return command.reply({
            embeds: [
                generateErrorEmbed("This isn't a valid set roles message!"),
            ],
        });

    async function getSelectRolesData() {
        if (!messagePermalinkData) return null;

        const guild = command.client.guilds.cache.get(
            messagePermalinkData.guildId
        );

        if (!guild || guild.id != command.guild?.id) return null;

        const channel = guild.channels.cache.get(
            messagePermalinkData.channelId
        );

        if (!channel || channel.guildId != command.guild?.id) return null;

        if (
            ![
                ChannelType.GuildText,
                ChannelType.GuildAnnouncement,
                ChannelType.GuildForum,
            ].includes(channel.type)
        )
            return null;

        if (channel.isTextBased()) {
            const message = await channel.messages.fetch(
                messagePermalinkData.messageId
            );

            if (
                !message ||
                message.guildId != command.guildId ||
                message.channelId != channel.id ||
                message.author.id != command.client.user.id
            ) {
                return null;
            }

            const actionRow = message.components[0];
            if (!actionRow) return null;

            const selectMenu = actionRow.components[0];
            if (!selectMenu) return null;

            if (selectMenu.type != ComponentType.StringSelect) return null;
            if (selectMenu.customId.split(",")[1] != "selectroles") return null;

            const embed = message.embeds[0];
            if (!embed) return null;

            return {
                embed: new EmbedBuilder(embed as APIEmbed),
                selectMenu: new StringSelectMenuBuilder(selectMenu.data),
                channel,
                message,
            };
        }

        return null;
    }

    // Text inputs
    const modalEmbedTitleInput =
        new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
                .setLabel("Embed Title")
                .setStyle(TextInputStyle.Short)
                .setValue(selectRolesMessageData.embed.data.title || "")
                .setCustomId("title")
                .setPlaceholder("(optional)")
        );

    const modalEmbedDescriptionInput =
        new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
                .setLabel("Embed Content")
                .setStyle(TextInputStyle.Paragraph)
                .setValue(selectRolesMessageData.embed.data.description || "")
                .setRequired(true)
                .setCustomId("description")
        );

    const modalEmbedColorInput =
        new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
                .setLabel("Embed Color")
                .setStyle(TextInputStyle.Short)
                .setValue(
                    `#${integerToHex(
                        Number(selectRolesMessageData.embed.data.color)
                    )}`
                )
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
                .setValue(selectRolesMessageData.embed.data.image?.url || "")
                .setPlaceholder("URL (optional)")
        );

    const modalEmbedThumbnailInput =
        new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
                .setLabel("Embed Thumbnail")
                .setStyle(TextInputStyle.Short)
                .setCustomId("thumbnail")
                .setRequired(false)
                .setValue(
                    selectRolesMessageData.embed.data.thumbnail?.url || ""
                )
                .setPlaceholder("URL (optional)")
        );

    const embedInfoModalHandshakeInteractionId =
        randomBytes(10).toString("hex");
    const embedInfoModal = new ModalBuilder()
        .setTitle("Edit Role Selector Embed")
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
        embed: embedData,
    };

    function requestRolesInput() {
        const selectMenu = new RoleSelectMenuBuilder()
            .setMaxValues(25)
            .setMinValues(1)
            .setCustomId(`${randomBytes(10).toString("hex")},selectroles`);

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

                updateMessage();
            })
            .catch((error) => {
                console.log(error);
                command.followUp({
                    embeds: [generateErrorEmbed("Time out!")],
                });
            });
    }

    function generateResultSelectMenu() {
        return new StringSelectMenuBuilder()
            .setOptions(
                entryData.roles.map((roleId) => {
                    return {
                        label: command.guild?.roles.cache.get(roleId)?.name
                            ? `@${command.guild?.roles.cache.get(roleId)?.name}`
                            : "@Unknwon Role",
                        value: roleId,
                    };
                })
            )
            .setMinValues(0)
            .setMaxValues(entryData.roles.length)
            .setCustomId(`${randomBytes(10).toString("hex")},selectroles`);
    }

    function updateMessage() {
        selectRolesMessageData?.message
            .edit({
                embeds: [embedData],
                components: [
                    new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
                        generateResultSelectMenu()
                    ),
                ],
            })
            .then(() => {
                command.followUp({
                    embeds: [generateSuccessEmbed("Message Updated!")],
                });
            });
    }
});

export default editRoleSelector;
