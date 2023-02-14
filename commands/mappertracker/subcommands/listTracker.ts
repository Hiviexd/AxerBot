import { EmbedBuilder, PermissionFlagsBits } from "discord.js";

import { tracks } from "../../../database";
import { SlashCommandSubcommand } from "../../../models/commands/SlashCommandSubcommand";
import colors from "../../../constants/colors";
import osuApi from "../../../helpers/osu/fetcher/osuApi";

const mappertrackerListTracker = new SlashCommandSubcommand(
    "list",
    "List all mapper trackers",
    false,
    undefined,
    [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages]
);

mappertrackerListTracker.setExecuteFunction(async (command) => {
    if (!command.guild) return;

    const allTrackers = await tracks.find({
        guild: command.guildId,
        type: "mapper",
    });

    async function mapTrackers() {
        let text = "";

        for (let i = 0; i < allTrackers.length; i++) {
            text = text.concat(
                `__**#${i + 1} | ${await getUsername(
                    allTrackers[i].userId || ""
                )}**__\n<#${allTrackers[i].channel}>\n\n`
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

export default mappertrackerListTracker;
