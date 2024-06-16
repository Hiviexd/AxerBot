import { ChannelType, SlashCommandChannelOption } from "discord.js";
import { tracks } from "../../../../database";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const bntrackerRemoveTracker = new SlashCommandSubcommand()
    .setName("remove")
    .setDescription("Remove a tracker for a channel")
    .setPermissions("ManageChannels")
    .addOptions(
        new SlashCommandChannelOption()
            .setName("channel")
            .setDescription("Tracker channel")
            .setRequired(true)
    );

bntrackerRemoveTracker.setExecutable(async (command) => {
    if (!command.member || typeof command.member.permissions == "string") return;

    const channel = command.options.getChannel("channel", true);

    const actualTrack = await tracks.find({
        guild: command.guildId,
        channel: channel.id,
        type: "qat",
    });

    if (actualTrack.length == 0)
        return command.editReply({
            embeds: [generateErrorEmbed("This channel doesn't have a tracker.")],
        });

    if (channel.type != ChannelType.GuildText)
        return command.editReply({
            embeds: [generateErrorEmbed("You need to provide a valid text channel.")],
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

export { bntrackerRemoveTracker };
