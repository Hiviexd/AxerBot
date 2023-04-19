import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} from "discord.js";
import { bot } from "../..";
import { MapperTracker } from "../../modules/mappertracker/mapperTrackerManager";
import osuApi from "../../modules/osu/fetcher/osuApi";
import { BeatmapsetEvent } from "../../types/beatmap";
import { diffWordsWithSpace } from "diff";

export async function SendBeatmapsetMetadataEdit(
    event: BeatmapsetEvent,
    tracker: MapperTracker.IMapperTracker
) {
    const beatmapset = await osuApi.fetch.beatmapset(
        event.beatmapset.id.toString()
    );

    if (!beatmapset || !beatmapset.data || beatmapset.status != 200) return;

    const url = `https://osu.ppy.sh/s/${beatmapset.data.id}`;

    const embed = new EmbedBuilder()

        .setTitle(`📝 Beatmapset General Update`)
        .setDescription(
            `**[${beatmapset.data.artist} - ${beatmapset.data.title}](${url})**\n Mapped by [${beatmapset.data.creator}](https://osu.ppy.sh/users/${beatmapset.data.user_id})\n\n`.concat(
                generateContent()
            )
        )
        .setColor("#FFA500")
        .setThumbnail(`https://b.ppy.sh/thumb/${beatmapset.data.id}l.jpg`);

    const guild = bot.guilds.cache.get(tracker.guild);

    if (!guild) return;

    function generateContent() {
        if (event.type == "genre_edit")
            return `- Genre changed from \`${event.comment.old}\` to \`${event.comment.new}\``;

        console.log(event.comment.old, event.comment.new);

        if (event.type == "tags_edit")
            return `- Tags changed\n\`\`\`diff\n${diffWordsWithSpace(
                event.comment.old as string,
                event.comment.new as string
            )
                .map(
                    (value) =>
                        `${getDiffChar(value.removed, value.added)} ${
                            value.value
                        }`
                )
                .join("\n")}\`\`\``;

        if (event.type == "offset_edit")
            return `- Offset changed from \`${event.comment.old}\` to \`${event.comment.new}\``;

        if (event.type == "language_edit")
            return `- Language changed from \`${event.comment.old}\` to \`${event.comment.new}\``;

        if (event.type == "beatmap_owner_change")
            return `- GD Owner for [${event.comment.beatmap_version}](https://osu.ppy.sh/b/${event.comment.beatmap_id}) changed to ${event.comment.new_user_id}](https://osu.ppy.sh/b/${event.comment.new_user_username})`;

        return `- Something was changed from \`${event.comment.old}\` to \`${event.comment.new}\``;

        function getDiffChar(removed?: boolean, added?: boolean) {
            if (removed && !added) return "-";

            if (added && !removed) return "+";

            return "";
        }
    }

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
