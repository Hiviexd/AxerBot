import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    ColorResolvable,
    EmbedBuilder,
    GuildChannelResolvable,
    GuildTextBasedChannel,
    ModalBuilder,
    PermissionFlagsBits,
    SlashCommandChannelOption,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import colors from "../../../../constants/colors";
import { randomBytes } from "crypto";

const verificationNewSyncEmbed = new SlashCommandSubcommand()
    .setName("syncembed")
    .setDescription("Send a new sync embed to the given channel")
    .setPermissions("ModerateMembers")
    .addOptions(
        new SlashCommandChannelOption()
            .setName("target_channel")
            .setDescription("Channel to send the embed")
            .setRequired(true)
            .addChannelTypes(
                ChannelType.GuildAnnouncement,
                ChannelType.GuildForum,
                ChannelType.GuildText
            )
    )
    .setModal(true);

verificationNewSyncEmbed.setExecutable(async (command) => {
    const targetChannel = command.options.getChannel("target_channel", true);

    if (!command.guild) return;

    const selfMember = command.guild.members.me;

    if (!selfMember) return;

    if (
        !selfMember
            .permissionsIn(targetChannel as GuildChannelResolvable)
            .has(PermissionFlagsBits.SendMessages)
    )
        return command.reply({
            embeds: [
                generateErrorEmbed("I don't have permissions to send messages on that channel!"),
            ],
        });

    const modal = new ModalBuilder()
        .setCustomId(randomBytes(10).toString("hex"))
        .setTitle("Sync Embed");

    const embedTitle = new ActionRowBuilder<TextInputBuilder>().setComponents(
        new TextInputBuilder()
            .setLabel("Embed Title")
            .setRequired(true)
            .setValue("📝 Sync Profile")
            .setStyle(TextInputStyle.Short)
            .setCustomId("title")
    );
    const embedContent = new ActionRowBuilder<TextInputBuilder>().setComponents(
        new TextInputBuilder()
            .setLabel("Embed Content")
            .setRequired(true)
            .setValue(
                "Press the button below to sync your discord profile with your osu! profile info"
            )
            .setStyle(TextInputStyle.Paragraph)
            .setCustomId("content")
    );
    const embedColor = new ActionRowBuilder<TextInputBuilder>().setComponents(
        new TextInputBuilder()
            .setLabel("Embed Color")
            .setRequired(false)
            .setValue(colors.pink as string)
            .setStyle(TextInputStyle.Short)
            .setCustomId("color")
    );
    modal.setComponents(embedTitle, embedContent, embedColor);

    await command.showModal(modal);
    const embedResponse = await command.awaitModalSubmit({
        time: 300000,
    });
    await embedResponse.deferUpdate();

    const titleResponse = embedResponse.fields.getTextInputValue("title");
    const contentResponse = embedResponse.fields.getTextInputValue("content");
    const colorResponse = embedResponse.fields.getTextInputValue("color");

    const embedData = new EmbedBuilder()
        .setTitle(titleResponse)
        .setColor(colors.pink)
        .setDescription(contentResponse);

    // Check if the input is a valid hex color input
    const hexValueRegExp = /^#([0-9a-f]{3}){1,2}$/i;

    if (colorResponse) {
        if (hexValueRegExp.test(colorResponse.toUpperCase()))
            embedData.setColor(colorResponse.toUpperCase() as ColorResolvable);
    }

    const syncProfileButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel("📥 Sync my Profile")
        .setCustomId(`syncprofile,${randomBytes(10).toString("hex")}`);

    await (targetChannel as GuildTextBasedChannel).send({
        embeds: [embedData],
        components: [new ActionRowBuilder<ButtonBuilder>().setComponents(syncProfileButton)],
    });

    command.followUp({
        embeds: [generateSuccessEmbed("Embed sent!")],
    });
});

export { verificationNewSyncEmbed };
