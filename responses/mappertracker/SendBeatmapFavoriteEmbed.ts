import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} from "discord.js";

import { bot } from "../..";
import colors from "../../constants/colors";
import { MapperTracker } from "../../modules/mappertracker/mapperTrackerManager";
import osuApi from "../../modules/osu/fetcher/osuApi";
import { CompressedBeatmapset } from "../../types/beatmap";

export async function sendBeatmapFavoriteEmbed(
    map: CompressedBeatmapset,
    tracker: MapperTracker.IMapperTracker
) {
    const beatmapset = await osuApi.fetch.beatmapset(map.id.toString());

    if (!beatmapset || !beatmapset.data || beatmapset.status != 200) return;

    const url = `https://osu.ppy.sh/s/${beatmapset.data.id}`;

    const embed = new EmbedBuilder()
        .setAuthor({
            name:
                beatmapset.data.recent_favourites[0].username || "Unknown User",
            iconURL: `https://a.ppy.sh/${beatmapset.data.recent_favourites[0].id}`,
        })
        .setTitle(`💟 New Favorite`)
        .setDescription(
            `**[${beatmapset.data.artist} - ${
                beatmapset.data.title
            }](${url})**\n Mapped by [${
                beatmapset.data.creator
            }](https://osu.ppy.sh/users/${
                beatmapset.data.user_id
            })\n\nBeatmap has \`${beatmapset.data.favourite_count}\` ${
                beatmapset.data.favourite_count === 1 ? "favorite" : "favorites"
            } now!`
        )
        .setColor(colors.pink)
        .setThumbnail(`https://b.ppy.sh/thumb/${beatmapset.data.id}l.jpg`)
        .setTimestamp();

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
}
