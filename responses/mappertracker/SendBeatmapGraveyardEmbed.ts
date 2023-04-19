import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} from "discord.js";

import { bot } from "../..";
import osuApi from "../../modules/osu/fetcher/osuApi";
import { Beatmapset } from "../../types/beatmap";
import { MapperTracker } from "../../modules/mappertracker/mapperTrackerManager";

export async function sendBeatmapGraveyardEmbed(
    beatmap: Beatmapset,
    tracker: MapperTracker.IMapperTracker
) {
    const beatmapset = await osuApi.fetch.beatmapset(beatmap.id.toString());

    if (!beatmapset || !beatmapset.data || beatmapset.status != 200) return;

    const url = `https://osu.ppy.sh/s/${beatmapset.data.id}`;

    const embed = new EmbedBuilder()
        .setTitle(`🪦 Graveyarded`)
        .setDescription(
            `**[${beatmapset.data.artist} - ${
                beatmapset.data.title
            }](${url})**\n Mapped by [${
                beatmapset.data.creator
            }](https://osu.ppy.sh/users/${
                beatmapset.data.user_id
            })\n\nThis map was updated <t:${Math.trunc(
                new Date(beatmapset.data.last_updated).getTime() / 1000
            )}:R> and it's graveyarded now...`
        )
        .setThumbnail(`https://b.ppy.sh/thumb/${beatmapset.data.id}l.jpg`);

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
