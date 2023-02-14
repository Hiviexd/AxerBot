import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} from "discord.js";
import { IMapperTracker } from "../../modules/mappertracker/mapperTrackerManager";
import { Beatmapset, CompressedBeatmapset } from "../../types/beatmap";
import colors from "../../constants/colors";
import generateColoredModeIcon from "../../helpers/text/generateColoredModeIcon";
import { bot } from "../..";
import osuApi from "../../helpers/osu/fetcher/osuApi";
import getEmoji from "../../helpers/text/getEmoji";

export async function sendBeatmapHypeEmbed(
    map: CompressedBeatmapset,
    tracker: IMapperTracker
) {
    const beatmapset = await osuApi.fetch.beatmapset(map.id.toString());

    if (!beatmapset || !beatmapset.data || beatmapset.status != 200) return;

    const hypeData = await osuApi.fetch.beatmapsetDiscussion(
        beatmapset.data.id.toString(),
        "hype"
    );

    const hype = hypeData.data.discussions[0]?.starting_post;

    const hypeAuthor = await osuApi.fetch.user(hype?.user_id.toString());

    const url = `https://osu.ppy.sh/s/${beatmapset.data.user_id}`;

    const embed = new EmbedBuilder()
        .setAuthor({
            name: hypeAuthor.data.username || "Unknown User",
            iconURL: `https://a.ppy.sh/${hypeAuthor.data.id}`,
        })
        .setTitle(`${getEmoji("hype")} Hype`)
        .setDescription(
            `**[${beatmapset.data.artist} - ${
                beatmapset.data.title
            }](${url})**\n Mapped by [${
                beatmapset.data.creator
            }](https://osu.ppy.sh/users/${beatmapset.data.user_id})\n\n${
                hype.message || "No comment provided..."
            }`
        )
        .setColor("#3295ff")
        .setFooter({
            text: `Posted by ${hypeAuthor.data.username || "Unknown User"}`,
        })
        .setTimestamp(new Date(hype.created_at) || new Date())
        .setThumbnail(beatmapset.data.covers["list@2x"]);

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
