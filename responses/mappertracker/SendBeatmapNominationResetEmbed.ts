import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

import { bot } from "../..";
import qatApi from "../../helpers/qat/fetcher/qatApi";
import osuApi from "../../modules/osu/fetcher/osuApi";
import { BeatmapsetEvent } from "../../types/beatmap";
import { MapperTracker } from "../../modules/mappertracker/mapperTrackerManager";

export async function SendBeatmapNominationResetEmbed(
    event: BeatmapsetEvent,
    tracker: MapperTracker.IMapperTracker
) {
    const beatmapset = await osuApi.fetch.beatmapset(event.beatmapset.id.toString());

    if (!beatmapset || !beatmapset.data || beatmapset.status != 200) return;

    async function fetchComment() {
        const resetDiscussion = await osuApi.fetch.beatmapsetDiscussion(
            event.comment.beatmap_discussion_id as number,
            "first"
        );

        if (!resetDiscussion.data || resetDiscussion.status != 200) return null;

        console.log(resetDiscussion.data);

        return resetDiscussion.data.discussions[0].posts[0].posts[0] || null;
    }

    const resetComment = await fetchComment();

    const url = `https://osu.ppy.sh/s/${beatmapset.data.id}`;

    const embed = new EmbedBuilder()
        .setAuthor({
            name: `${resetComment?.user_id || "deleted_user"}`,
            iconURL: `https://a.ppy.sh/${resetComment?.user_id}`,
        })
        .setTitle(`🗯️ Nomination Reset`)
        .setDescription(
            `**[${beatmapset.data.artist} - ${beatmapset.data.title}](${url})**\n Mapped by [${
                beatmapset.data.creator
            }](https://osu.ppy.sh/users/${beatmapset.data.user_id})\n\n${
                resetComment?.message || "No comment provided..."
            }`
        )
        .setColor("#CC2C2C")
        .setTimestamp(new Date(event.created_at))
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
