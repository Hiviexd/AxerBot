import { ChannelType, PermissionFlagsBits } from "discord.js";

import * as database from "../../../../database";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const quotesAllowChannels = new SlashCommandSubcommand(
    "channel",
    "Set channels that quotes can run. ",
    undefined,
    [PermissionFlagsBits.ManageChannels]
);

quotesAllowChannels.builder.addStringOption((o) =>
    o
        .setName("channels")
        .setDescription(
            'Channel names without # and split by comma. Use "all" to allow all channels'
        )
        .setRequired(true)
);

quotesAllowChannels.setExecuteFunction(async (command) => {
    let guild = await database.guilds.findById(command.guildId);

    if (!command.guild) return;
    if (!guild) return;

    const channel = command.options.getString("channels", true);

    let channels: string[] = [];

    channel.split(",").forEach((channelName) => {
        channelName = channelName.trim();

        const requested = command.guild?.channels.cache.find(
            (c) => c.name == channelName
        );

        if (requested && requested.type == ChannelType.GuildText) {
            channels.push(requested.id);
        }
    });

    if (channels[0] == "all") channels = ["all"];

    let blacklist = guild.fun.blacklist.channels;

    if (channels.length)
        return generateErrorEmbed("Provide valid text channels!");

    channels.forEach((channel) => {
        if (
            !blacklist.includes(channel) &&
            !["all", "none"].includes(channel)
        ) {
            blacklist = blacklist.filter((l: string) => l != channel);
        }
    });

    guild.fun.blacklist.channels = blacklist;

    await database.guilds.findOneAndUpdate({ _id: command.guildId }, guild);

    command.editReply({
        embeds: [
            generateSuccessEmbed(`✅ Done! Use \`/quotes status\` to check`),
        ],
    });
});

export default quotesAllowChannels;
