import { EmbedBuilder, StringSelectMenuBuilder } from "discord.js";

import colors from "../../../../constants/colors";
import osuApi from "../../../../modules/osu/fetcher/osuApi";
import generateErrorEmbedWithTitle from "../../../../helpers/text/embeds/generateErrorEmbedWithTitle";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import { Beatmapset } from "../../../../types/beatmap";
import getEmoji from "../../../../helpers/text/getEmoji";
import truncateString from "../../../../helpers/text/truncateString";
import { generateStepEmbedWithChoices } from "../../../../helpers/commands/generateStepEmbedWithChoices";
import BeatmapsetEmbed from "../../../../responses/osu/BeatmapsetEmbed";

export enum BeatmapGenre {
    any = "0",
    Unspecified = "1",
    VideoGame = "2",
    Anime = "3",
    Rock = "4",
    Pop = "5",
    Other = "6",
    Novelty = "7",
    HipHop = "9",
    Electronic = "10",
    Metal = "11",
    Classical = "12",
    Folk = "13",
    Jazz = "14",
}

export enum BeatmapLanguage {
    Any = "0",
    Unspecified = "1",
    English = "2",
    Japanese = "3",
    Chinese = "4",
    Instrumental = "5",
    Korean = "6",
    French = "7",
    German = "8",
    Swedish = "9",
    Spanish = "10",
    Italian = "11",
    Russian = "12",
    Polish = "13",
    Other = "14",
}

export enum BeatmapStatus {
    WIP = "wip",
    Ranked = "ranked",
    Pending = "pending",
    Loved = "loved",
    Qualified = "qualified",
    Graveyard = "graveyard",
}

const searchBeatmap = new SlashCommandSubcommand("search", "Search a beatmap");

searchBeatmap.builder
    .addStringOption((o) =>
        o
            .setName("query")
            .setDescription("Beatmap title, artist, creator or something...")
            .setRequired(true)
    )
    .addStringOption((o) =>
        o.setName("star_rating").setDescription("Filter by stars using operators like: <2, >3, <32")
    )
    .addStringOption((o) =>
        o
            .setName("mode")
            .setDescription("Filter beatmaps that contain mode:")
            .addChoices(
                { name: "osu!", value: "0" },
                { name: "osu!taiko", value: "1" },
                { name: "osu!catch", value: "2" },
                { name: "osu!mania", value: "3" }
            )
    )
    .addStringOption((o) =>
        o
            .setName("status")
            .setDescription("Filter by status")
            .addChoices(
                { name: "Ranked", value: BeatmapStatus.Ranked },
                { name: "Qualified", value: BeatmapStatus.Qualified },
                { name: "Loved", value: BeatmapStatus.Loved },
                { name: "Pending", value: BeatmapStatus.Pending },
                { name: "WIP", value: BeatmapStatus.WIP },
                { name: "Graveyard", value: BeatmapStatus.Graveyard }
            )
    )
    .addStringOption((o) =>
        o
            .setName("genre")
            .setDescription("Filter results by genre")
            .addChoices(
                { name: "Video Game", value: BeatmapGenre.VideoGame },
                { name: "Anime", value: BeatmapGenre.Anime },
                { name: "Rock", value: BeatmapGenre.Rock },
                { name: "Pop", value: BeatmapGenre.Pop },
                { name: "Novelty", value: BeatmapGenre.Novelty },
                { name: "Hip Hop", value: BeatmapGenre.HipHop },
                { name: "Electronic", value: BeatmapGenre.Electronic },
                { name: "Metal", value: BeatmapGenre.Metal },
                { name: "Classical", value: BeatmapGenre.Classical },
                { name: "Folk", value: BeatmapGenre.Folk },
                { name: "Jazz", value: BeatmapGenre.Jazz },
                { name: "Other", value: BeatmapGenre.Other }
            )
    )
    .addStringOption((o) =>
        o
            .setName("language")
            .setDescription("Filter results by language")
            .addChoices(
                { name: "English", value: BeatmapLanguage.English },
                { name: "Japanese", value: BeatmapLanguage.Japanese },
                { name: "Chinese", value: BeatmapLanguage.Chinese },
                { name: "Instrumental", value: BeatmapLanguage.Instrumental },
                { name: "Korean", value: BeatmapLanguage.Korean },
                { name: "French", value: BeatmapLanguage.French },
                { name: "German", value: BeatmapLanguage.German },
                { name: "Swedish", value: BeatmapLanguage.Swedish },
                { name: "Spanish", value: BeatmapLanguage.Spanish },
                { name: "Italian", value: BeatmapLanguage.Italian },
                { name: "Russian", value: BeatmapLanguage.Russian },
                { name: "Polish", value: BeatmapLanguage.Polish },
                { name: "Other", value: BeatmapLanguage.Other }
            )
    );

searchBeatmap.setExecuteFunction(async (command) => {
    const query = command.options.getString("query", true);
    let starRating = command.options.getString("star_rating") || "";
    const genre = command.options.getString("genre") || "";
    const mode = command.options.getString("mode") || "";
    const status = command.options.getString("status") || "";
    const language = command.options.getString("language") || "";

    if (starRating && ![">", "<"].includes(starRating[0]))
        return command.editReply({
            embeds: [
                generateErrorEmbedWithTitle(
                    "Invalid input",
                    "Star Rating input format must be `<number` or `>number`. Example: `<3` will search for beatmaps with sr > 3"
                ),
            ],
        });

    const searchData = await osuApi.fetch.searchBeatmapset(
        query,
        mode,
        status,
        starRating,
        genre as BeatmapGenre,
        language as BeatmapLanguage
    );

    if (searchData.status != 200 || !searchData.data || searchData.data.error)
        return command.editReply({
            embeds: [
                generateErrorEmbedWithTitle(
                    "Someting went wrong!",
                    searchData.data?.error || "Maybe osu! api sucks"
                ),
            ],
        });

    const beatmapsets = searchData.data.beatmapsets.slice(0, 10);

    const embed = new EmbedBuilder()
        .setColor(colors.yellow)
        .setTitle(`🔎 Beatmap search results for "${query}"`)
        .setDescription(truncateString(generateDescription(), 4096, true))
        .setFooter({
            text: `Displaying ${beatmapsets.length} of ${searchData.data.total} results`,
        });

    if (beatmapsets.length != 0)
        embed.setThumbnail(`https://b.ppy.sh/thumb/${beatmapsets[0].id}l.jpg`);

    const resultsSelectMenu = new StringSelectMenuBuilder()
        .setCustomId("banana")
        .setPlaceholder("Select a beatmap result")
        .addOptions(
            beatmapsets.map((m, i) => {
                return {
                    label: truncateString(
                        `#${i + 1} | ${truncateString(`${m.artist} - ${m.title}`, 70, true)} by ${
                            m.creator
                        }`,
                        100,
                        true
                    ),
                    value: m.id.toString(),
                };
            })
        );

    generateStepEmbedWithChoices(command, "", "", resultsSelectMenu, embed)
        .then((results) => {
            const selectedId = results.data[0];

            const map = beatmapsets.find((m) => m.id.toString() == selectedId);

            if (!map) return;

            return BeatmapsetEmbed.send(map, null, mode, command);
        })
        .catch((e) => {
            return command.editReply({
                components: [],
                content: "",
                embeds: [embed],
            });
        });

    function getModes(mapset: Beatmapset) {
        const modes: string[] = [];

        if (!mapset.beatmaps) return "???";

        mapset.beatmaps.forEach((m) => {
            if (!modes.includes(m.mode)) modes.push(m.mode);
        });

        return modes.map((m) => getEmoji(m as keyof typeof getEmoji)).join(" ");
    }

    function generateDescription() {
        if (searchData.status != 200 || !searchData.data || searchData.data.error)
            return "No results found for your search...";

        if (searchData.data.beatmapsets.length < 1) return "No results found for your search...";

        const result = beatmapsets
            .map(
                (m, i) =>
                    `**#${i + 1} |** [${m.artist} - ${m.title} by **${
                        m.creator
                    }**](https://osu.ppy.sh/s/${m.id}) [${getModes(m)}]`
            )
            .join("\n");

        return result;
    }

    command.editReply({
        embeds: [embed],
    });
});

export default searchBeatmap;
