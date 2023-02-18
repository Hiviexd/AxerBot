import { PermissionFlagsBits } from "discord.js";

import { tracks } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";

const mappertrackerRemoveTracker = new SlashCommandSubcommand(
    "remove",
    "List all mapper trackers",
    undefined,
    [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages]
);

mappertrackerRemoveTracker.builder.addIntegerOption((o) =>
    o.setName("index").setDescription("Tracker index").setRequired(true)
);

mappertrackerRemoveTracker.setExecuteFunction(async (command) => {
    if (!command.guild) return;

    let allTrackers = await tracks.find({
        guild: command.guildId,
        type: "mapper",
    });

    const index = command.options.getInteger("index", true);

    const target = allTrackers.find((t, i) => i == (index < 0 ? 0 : index) - 1);

    if (!target)
        return command.editReply({
            embeds: [generateErrorEmbed("Invalid index provided!")],
        });

    await tracks.deleteOne({
        _id: target._id,
    });

    return command.editReply({
        embeds: [generateSuccessEmbed("Tracker removed!")],
    });
});

export default mappertrackerRemoveTracker;
