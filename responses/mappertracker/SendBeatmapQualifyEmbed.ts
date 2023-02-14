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
import qatApi from "../../helpers/qat/fetcher/qatApi";

export async function SendBeatmapQualifyEmbed(
    map: CompressedBeatmapset,
    tracker: IMapperTracker
) {
    const beatmapset = await osuApi.fetch.beatmapset(map.id.toString());

    if (!beatmapset || !beatmapset.data || beatmapset.status != 200) return;

    const qatData = await qatApi.fetch.events(beatmapset.data.id.toString());

    const nomUser = await fetchNominator(
        beatmapset.data.current_nominations[0].user_id
    );

    const nom = qatData.data
        ?.sort(
            (a, b) =>
                new Date(b.createdAt).valueOf() -
                new Date(a.createdAt).valueOf()
        )
        .find(
            (n) =>
                (n.type == "qualify" &&
                    n.userId ==
                        beatmapset.data.current_nominations[1].user_id) ||
                (n.type == "qualify" &&
                    n.userId == beatmapset.data.current_nominations[0].user_id)
        );

    const url = `https://osu.ppy.sh/s/${beatmapset.data.id}`;

    const embed = new EmbedBuilder()
        .setAuthor({
            name: `${nomUser?.username || "deleted_user"}`,
            iconURL: `https://a.ppy.sh/${nomUser?.id}`,
        })
        .setTitle(`❤️ Qualified beatmap`)
        .setDescription(
            `**[${beatmapset.data.artist} - ${
                beatmapset.data.title
            }](${url})**\n Mapped by [${
                beatmapset.data.creator
            }](https://osu.ppy.sh/users/${beatmapset.data.user_id})\n\n[${
                (
                    await fetchNominator(
                        beatmapset.data.current_nominations[1].user_id
                    )
                )?.username || "deleted_user"
            }](https://osu.ppy.sh/users/${
                beatmapset.data.current_nominations[1].user_id
            }) ${nom?.content || "No comment provided..."}`
        )
        .setColor("#ff4b63")
        .setThumbnail(beatmapset.data.covers["cover@2x"]);

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

    channel.send({
        embeds: [embed],
        components: [buttonsActionRow],
    });
}
