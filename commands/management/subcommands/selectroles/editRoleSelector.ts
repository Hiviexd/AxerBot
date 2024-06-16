import { randomBytes } from "crypto";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import {
    TextInputBuilder,
    ActionRowBuilder,
    TextInputStyle,
    ModalBuilder,
    EmbedBuilder,
    ColorResolvable,
    RoleSelectMenuBuilder,
    ChannelType,
    StringSelectMenuBuilder,
    SlashCommandStringOption,
} from "discord.js";
import { generateStepEmbedWithChoices } from "../../../../helpers/commands/generateStepEmbedWithChoices";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import { selectRoles } from "../../../../database";

const editRoleSelector = new SlashCommandSubcommand()
    .setName("edit")
    .setDescription("Edit a role select menu")
    .addOptions(
        new SlashCommandStringOption()
            .setName("message_url")
            .setDescription("Message permalink")
            .setRequired(true)
    )
    .setPermissions("ManageRoles", "ModerateMembers");

function parseMessagePermalink(messageUrl: string) {
    try {
        const messageUrlParameters = new URL(messageUrl);
        if (!messageUrlParameters.hostname.endsWith("discord.com")) return null;

        const paths = messageUrlParameters.pathname.split("/").slice(1);

        if (paths.length != 4) return null;

        if (paths[0] != "channels") return null;

        if (isNaN(Number(paths[1])) || isNaN(Number(paths[2])) || isNaN(Number(paths[3])))
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

editRoleSelector.setExecutable(async (command) => {
    const messageUrl = command.options.getString("message_url", true);

    const messagePermalinkData = parseMessagePermalink(messageUrl);

    if (!messagePermalinkData)
        return command.reply({
            embeds: [generateErrorEmbed("Provide a valid message URL")],
        });

    const selectRolesMessageData = await selectRoles.findOne({
        _id: messagePermalinkData.messageId,
        guild_id: command.guildId,
        channel: messagePermalinkData.channelId,
    });

    if (!selectRolesMessageData)
        return command.reply({
            embeds: [generateErrorEmbed("This isn't a valid set roles message!")],
        });

    // Text inputs
    const modalEmbedTitleInput = new ActionRowBuilder<TextInputBuilder>().setComponents(
        new TextInputBuilder()
            .setLabel("Embed Title")
            .setStyle(TextInputStyle.Short)
            .setValue(selectRolesMessageData.embed.title || "")
            .setCustomId("title")
            .setPlaceholder("(optional)")
    );

    const modalEmbedDescriptionInput = new ActionRowBuilder<TextInputBuilder>().setComponents(
        new TextInputBuilder()
            .setLabel("Embed Content")
            .setStyle(TextInputStyle.Paragraph)
            .setValue(selectRolesMessageData.embed.description || "")
            .setRequired(true)
            .setCustomId("description")
    );

    const modalEmbedColorInput = new ActionRowBuilder<TextInputBuilder>().setComponents(
        new TextInputBuilder()
            .setLabel("Embed Color")
            .setStyle(TextInputStyle.Short)
            .setValue(`${selectRolesMessageData.embed.color}`)
            .setCustomId("color")
            .setRequired(false)
            .setPlaceholder("HEX format (optional)")
    );

    // Image inputs
    const modalEmbedImageInput = new ActionRowBuilder<TextInputBuilder>().setComponents(
        new TextInputBuilder()
            .setLabel("Embed Image")
            .setStyle(TextInputStyle.Short)
            .setCustomId("image")
            .setRequired(false)
            .setValue(selectRolesMessageData.embed.image || "")
            .setPlaceholder("URL (optional)")
    );

    const modalEmbedThumbnailInput = new ActionRowBuilder<TextInputBuilder>().setComponents(
        new TextInputBuilder()
            .setLabel("Embed Thumbnail")
            .setStyle(TextInputStyle.Short)
            .setCustomId("thumbnail")
            .setRequired(false)
            .setValue(selectRolesMessageData.embed.thumbnail || "")
            .setPlaceholder("URL (optional)")
    );

    const embedInfoModalHandshakeInteractionId = randomBytes(10).toString("hex");
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
    const embedDescription = embedInfoModalResponse.fields.getTextInputValue("description");
    const embedColor = embedInfoModalResponse.fields.getTextInputValue("color");
    const embedThumbnail = embedInfoModalResponse.fields.getTextInputValue("thumbnail");
    const embedImage = embedInfoModalResponse.fields.getTextInputValue("image");

    const embedData = new EmbedBuilder().setTitle(embedTitle).setDescription(embedDescription);

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
            embedData.setImage(new URL(embedImage).href);
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

    async function updateMessage() {
        try {
            const targetChannel = command.guild?.channels.cache.get(
                selectRolesMessageData?.channel || ""
            );

            if (
                !targetChannel ||
                ![
                    ChannelType.GuildText,
                    ChannelType.GuildAnnouncement,
                    ChannelType.GuildForum,
                ].includes(targetChannel.type) ||
                !targetChannel.isTextBased()
            )
                return command.followUp({
                    embeds: [generateErrorEmbed("Channel not found!")],
                });

            const targetMessage = await targetChannel.messages.fetch(
                selectRolesMessageData?._id || ""
            );

            if (!targetMessage)
                return command.followUp({
                    embeds: [generateErrorEmbed("Message not found!")],
                });

            await selectRoles.updateOne(
                { _id: targetMessage.id },
                {
                    roles: entryData.roles,
                    embed: {
                        title: embedTitle,
                        description: embedDescription,
                        color: embedColor,
                        image: embedImage,
                        thumbnail: embedThumbnail,
                    },
                }
            );

            targetMessage
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
        } catch (e) {
            console.error(e);

            command.followUp({
                embeds: [generateErrorEmbed("Something went wrong...")],
            });
        }
    }
});

export { editRoleSelector };
