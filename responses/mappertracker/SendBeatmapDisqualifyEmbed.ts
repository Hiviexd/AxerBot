import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} from "discord.js";

import { bot } from "../..";
import qatApi from "../../helpers/qat/fetcher/qatApi";
import { MapperTracker } from "../../modules/mappertracker/mapperTrackerManager";
import osuApi from "../../modules/osu/fetcher/osuApi";
import { BeatmapsetEvent } from "../../types/beatmap";

export async function SendBeatmapDisqualifyEmbed(
    event: BeatmapsetEvent,
    tracker: MapperTracker.IMapperTracker
) {
    const beatmapset = await osuApi.fetch.beatmapset(
        event.beatmapset.id.toString()
    );

    if (!beatmapset || !beatmapset.data || beatmapset.status != 200) return;

    const nomUser = await fetchNominator(event.user_id);

    const url = `https://osu.ppy.sh/s/${beatmapset.data.id}`;

    const embed = new EmbedBuilder()
        .setAuthor({
            name: `${nomUser?.username || "deleted_user"}`,
            iconURL: `https://a.ppy.sh/${nomUser?.id}`,
        })
        .setTitle(`💔 Disqualified`)
        .setDescription(
            `**[${beatmapset.data.artist} - ${
                beatmapset.data.title
            }](${url})**\n Mapped by [${
                beatmapset.data.creator
            }](https://osu.ppy.sh/users/${beatmapset.data.user_id})\n\n${
                event.discussion?.starting_post.message ||
                "No comment provided..."
            }`
        )
        .setColor("#CC2C2C")
        .setTimestamp(new Date(event.created_at))
        .setThumbnail(`https://b.ppy.sh/thumb/${beatmapset.data.id}l.jpg`);

    async function fetchNominator(id: number) {
        const u = await osuApi.fetch.user(id.toString());

        if (!u.data || u.status != 200) return null;

        return u.data;
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
}
