import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    GuildTextBasedChannel,
} from "discord.js";
import { IMapperTracker } from "../../modules/mappertracker/mapperTrackerManager";
import { Beatmapset, CompressedBeatmapset } from "../../types/beatmap";
import colors from "../../constants/colors";
import generateColoredModeIcon from "../../helpers/text/generateColoredModeIcon";
import { bot } from "../..";
import osuApi from "../../helpers/osu/fetcher/osuApi";

export async function sendBeatmapLovedEmbed(
    map: CompressedBeatmapset,
    tracker: IMapperTracker
) {
    const beatmapset = await osuApi.fetch.beatmapset(map.id.toString());

    if (!beatmapset || !beatmapset.data || beatmapset.status != 200) return;

    const url = `https://osu.ppy.sh/s/${beatmapset.data.id}`;

    const embed = new EmbedBuilder()
        .setTitle(`💝 Loved`)
        .setDescription(
            `**[${beatmapset.data.artist} - ${beatmapset.data.title}](${url})**\n Mapped by [${beatmapset.data.creator}](https://osu.ppy.sh/users/${beatmapset.data.user_id})\n\n`.concat(
                generateBeatmapDescription()
            )
        )
        .setTimestamp(new Date(beatmapset.data.last_updated))
        .setColor("#f45592")
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
                )} __**${
                    difficulty.version
                }**__ **|** ${difficulty.difficulty_rating.toFixed(2)} ⭐\n`
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

    channel.send({
        embeds: [embed],
        components: [buttonsActionRow],
    });
}
