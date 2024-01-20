import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

import { bot } from "../..";
import generateColoredModeIcon from "../../helpers/text/generateColoredModeIcon";
import { parseOsuPathId } from "../../helpers/text/parseOsuPathId";
import { MapperTracker } from "../../modules/mappertracker/mapperTrackerManager";
import osuApi from "../../modules/osu/fetcher/osuApi";
import { UserRecentEvent } from "../../types/user";
import { tracks } from "../../database";

export async function sendBeatmapReviveEmbed(
    event: UserRecentEvent,
    tracker: MapperTracker.IMapperTracker
) {
    try {
        if (!event.beatmapset) return;

        const beatmapset = await osuApi.fetch.beatmapset(parseOsuPathId(event.beatmapset.url));

        if (!beatmapset || !beatmapset.data || beatmapset.status != 200) return;

        const url = `https://osu.ppy.sh/s/${beatmapset.data.id}`;

        const embed = new EmbedBuilder()
            .setTitle(`♻️ Revived`)
            .setDescription(
                `**[${beatmapset.data.artist} - ${beatmapset.data.title}](${url})**\n Mapped by [${beatmapset.data.creator}](https://osu.ppy.sh/users/${beatmapset.data.user_id})\n\n`.concat(
                    generateBeatmapDescription()
                )
            )
            .setColor("#1df27d")
            .setThumbnail(`https://b.ppy.sh/thumb/${beatmapset.data.id}l.jpg`);

        function generateBeatmapDescription() {
            const diffs = beatmapset.data.beatmaps;

            if (!diffs) return "This beatmapset has no difficulties...";

            diffs.sort((a, b) => b.difficulty_rating - a.difficulty_rating);
            diffs.splice(3, 9999);

            let description = `Displaying ${diffs.length} of ${beatmapset.data.beatmaps?.length} difficulties:\n`;

            diffs.forEach((difficulty) => {
                description = description.concat(
                    `${generateColoredModeIcon(
                        difficulty.mode,
                        difficulty.difficulty_rating
                    )} __**${difficulty.version}**__ **|** ${difficulty.difficulty_rating.toFixed(
                        2
                    )} ⭐\n`
                );
            });

            return description;
        }

        const guild = bot.guilds.cache.get(tracker.guild);

        if (!guild) return;

        const channel = guild.channels.cache.get(tracker.channel);

        if (!channel || !channel.isTextBased()) return;

        const buttonsActionRow = new ActionRowBuilder<ButtonBuilder>();

        const beatmapPageButton = new ButtonBuilder()
            .setLabel("Beatmap page")
            .setStyle(ButtonStyle.Link)
            .setURL(url);

        buttonsActionRow.addComponents(beatmapPageButton);

        channel
            .send({
                embeds: [embed],
                components: [buttonsActionRow],
            })
            .catch(console.error);
    } catch (e: any) {
        console.error(e);

        if (e.status == 403 || e.status == 404) return tracks.deleteOne({ _id: tracker._id });
    }
}
