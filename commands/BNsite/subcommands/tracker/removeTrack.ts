import {
    ChannelType,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
} from "discord.js";
import { tracks } from "../../../../database";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const removeTracker = new SlashCommandSubcommand(
    "remove",
    "Remove a tracker for a channel",
    false,
    {
        syntax: `/bntracker remove <#channel>`,
    },
    [PermissionFlagsBits.ManageChannels]
);

removeTracker.builder.addChannelOption((o) =>
    o.setName("channel").setDescription("Tracker channel").setRequired(true)
);

removeTracker.setExecuteFunction(async (command) => {
    await command.deferReply();

    if (!command.member || typeof command.member.permissions == "string")
        return;

    const channel = command.options.getChannel("channel", true);

    const actualTrack = await tracks.find({
        guild: command.guildId,
        channel: channel.id,
        type: "qat",
    });

    if (actualTrack.length == 0)
        return command.editReply({
            embeds: [
                generateErrorEmbed("This channel doesn't have a tracker."),
            ],
        });

    if (channel.type != ChannelType.GuildText)
        return command.editReply({
            embeds: [
                generateErrorEmbed("You need to provide a valid text channel."),
            ],
        });

    await tracks.deleteMany({
        guild: command.guildId,
        channel: channel.id,
        type: "qat",
    });

    command.editReply({
        embeds: [generateSuccessEmbed("Tracker removed!")],
    });
});

export default removeTracker;
