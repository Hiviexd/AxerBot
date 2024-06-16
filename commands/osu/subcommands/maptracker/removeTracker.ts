import { StringSelectMenuBuilder } from "discord.js";

import { tracks } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import { generateStepEmbedWithChoices } from "../../../../helpers/commands/generateStepEmbedWithChoices";
import osuApi from "../../../../modules/osu/fetcher/osuApi";

const mapperTrackerRemoveTracker = new SlashCommandSubcommand()
    .setName("remove")
    .setDescription("remove a mapper tracker from a channel")
    .setPermissions("ManageChannels");

mapperTrackerRemoveTracker.setExecutable(async (command) => {
    if (!command.guild) return;

    let allTrackers = await tracks.find({
        guild: command.guildId,
        type: "mapper",
    });

    const trackers = new StringSelectMenuBuilder().setMaxValues(allTrackers.length).setMinValues(1);

    const users = await osuApi.fetch.users(allTrackers.map((t) => t.userId || ""));

    for (const tracker of allTrackers) {
        trackers.addOptions({
            label: `${
                users.data.find((u) => u.id.toString() == tracker.userId)?.username ||
                "Unknown User"
            } | #${
                command.guild.channels.cache.get(String(tracker.channel))?.name || "Deleted Channel"
            }`,
            value: tracker._id,
        });
    }

    generateStepEmbedWithChoices(
        command,
        "Select trackers to remove",
        "You can select multiple trackers",
        trackers,
        undefined,
        true
    ).then(async (trackers) => {
        const ids = trackers.data;

        for (const id of ids) {
            await tracks.deleteOne({ _id: id });
        }

        command.editReply({
            content: "",
            embeds: [generateSuccessEmbed("Tracker removed!")],
        });
    });
});

export { mapperTrackerRemoveTracker };
