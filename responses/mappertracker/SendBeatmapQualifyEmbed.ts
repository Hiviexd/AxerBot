import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { bot } from "../..";
import qatApi from "../../helpers/qat/fetcher/qatApi";
import osuApi from "../../modules/osu/fetcher/osuApi";
import { BeatmapsetEvent } from "../../types/beatmap";
import { MapperTracker } from "../../modules/mappertracker/mapperTrackerManager";
import { tracks } from "../../database";

export async function SendBeatmapQualifyEmbed(
    event: BeatmapsetEvent,
    tracker: MapperTracker.IMapperTracker
) {
    try {
        const beatmapset = await osuApi.fetch.beatmapset(event.beatmapset.id.toString());

        if (!beatmapset || !beatmapset.data || beatmapset.status != 200) return;

        const nomUser = await fetchNominator(beatmapset.data.current_nominations[0].user_id);

        const url = `https://osu.ppy.sh/s/${beatmapset.data.id}`;

        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${`${nomUser?.username}` || "deleted_user"}`,
                iconURL: `https://a.ppy.sh/${nomUser?.id || "Unknown User"}`,
            })
            .setTitle(`❤️ Qualified`)
            .setDescription(
                `**[${beatmapset.data.artist} - ${beatmapset.data.title}](${url})**\n Mapped by [${
                    beatmapset.data.creator
                }](https://osu.ppy.sh/users/${beatmapset.data.user_id})\n\n${
                    nomUser
                        ? (await fetchNominationComment(nomUser.id))?.content ||
                          "No comment provided..."
                        : "No comment provided..."
                }`
            )
            .setColor("#ff4b63")
            .setThumbnail(`https://b.ppy.sh/thumb/${beatmapset.data.id}l.jpg`)
            .setTimestamp(new Date(event.created_at));

        async function fetchNominator(id: number) {
            const u = await osuApi.fetch.user(id.toString());

            if (!u.data || u.status != 200) return null;

            return u.data;
        }

        async function fetchNominationComment(nominatorId: number) {
            const events = await qatApi.fetch.events(beatmapset.data.id);

            if (
                !events.data ||
                events.status != 200 ||
                typeof events.data != "object" ||
                !events.data.sort
            )
                return null;

            return (
                events.data
                    .sort(
                        (a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()
                    )
                    .find((event) => event.type == "qualify" && event.userId == nominatorId) || null
            );
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
    } catch (e: any) {
        console.error(e);

        if (e.status == 403 || e.status == 404) return tracks.deleteOne({ _id: tracker._id });
    }
}
