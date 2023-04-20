import { EmbedBuilder, PermissionFlagsBits } from "discord.js";

import { tracks } from "../../../../database";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import colors from "../../../../constants/colors";
import osuApi from "../../../../modules/osu/fetcher/osuApi";
import { MapperTrackerType } from "../../mappertracker";

const IMapperTrackerListTracker = new SlashCommandSubcommand(
    "list",
    "List all mapper trackers",
    undefined,
    [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages]
);

interface MapperTracker {
    _id: string;
    targetsArray: string[];
    userId: string;
    channel: string;
    guild: string;
    type: "mapper";
}

IMapperTrackerListTracker.setExecuteFunction(async (command) => {
    if (!command.guild) return;

    const targetTypes = {
        nominate: "Nominate",
        qualify: "Qualify",
        disqualify: "Disqualify",
        nomination_reset: "Nomination Reset",
        nomination_reset_received: "Nomination Reset",
        rank: "Rank",
        genre_edit: "Genre Edit",
        language_edit: "Language Edit",
        offset_edit: "Offset Edit",
        tags_edit: "Tags Edit",
        beatmap_owner_change: "Owner Change",
        beatmapsetRevive: "Revive",
        beatmapsetUpload: "Upload",
        beatmapsetUpdate: "Update",
    };

    const allTrackers = (await tracks.find({
        guild: command.guildId,
        type: "mapper",
    })) as unknown as MapperTracker[];

    const users = await osuApi.fetch.users(allTrackers.map((t) => t.userId));

    async function mapTrackers() {
        let text = "";

        for (let i = 0; i < allTrackers.length; i++) {
            text = text.concat(
                `__**#${i + 1} | ${
                    users.data.find(
                        (u) => u.id.toString() == allTrackers[i].userId
                    )?.username
                }**__\n<#${allTrackers[i].channel}> [${(
                    allTrackers[i]
                        .targetsArray as unknown as MapperTrackerType[]
                )
                    .map((target) => targetTypes[target])
                    .join(", ")}]\n\n`
            );
        }

        return text;
    }

    const embed = new EmbedBuilder()
        .setTitle("📃 All active trackers")
        .setColor(colors.gold)
        .setDescription(
            `${
                allTrackers.length == 0
                    ? "You don't have any tracker..."
                    : await mapTrackers()
            }`
        );

    async function getUsername(id: number | string) {
        const u = await osuApi.fetch.user(id.toString());

        if (!u || !u.data || u.status != 200) return ":warning: User Not Found";

        return u.data.username;
    }

    return command.editReply({
        embeds: [embed],
    });
});

export default IMapperTrackerListTracker;
