import { randomInt, randomUUID } from "crypto";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import generateErrorEmbedWithTitle from "../../../../helpers/text/embeds/generateErrorEmbedWithTitle";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import osuApi from "../../../../modules/osu/fetcher/osuApi";
import { BeatmapStatus, BeatmapGenre, BeatmapLanguage } from "./searchBeatmap";
import BeatmapsetEmbed from "../../../../responses/osu/BeatmapsetEmbed";
import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import truncateString from "../../../../helpers/text/truncateString";

const randomBeatmap = new SlashCommandSubcommand(
    "random",
    "Search a random beatmap with the given parameters"
);

randomBeatmap.builder
    .addStringOption((o) =>
        o
            .setName("star_rating")
            .setDescription("Filter by stars using operators like: <2, >3, <32")
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

randomBeatmap.setExecuteFunction(async (command) => {
    let starRating = command.options.getString("star_rating") || "";
    const genre = command.options.getString("genre") || "";
    const mode = command.options.getString("mode") || "";
    const status = command.options.getString("status") || "";
    const language = command.options.getString("language") || "";

    if (starRating && ![">", "<", "="].includes(starRating[0]))
        return command.editReply({
            embeds: [
                generateErrorEmbedWithTitle(
                    "Invalid input",
                    "Star Rating input format must be `<number` or `>number`. Example: `<3` will search for beatmaps with sr > 3"
                ),
            ],
        });

    const allResults = await osuApi.fetch.searchBeatmapset(
        "",
        mode,
        status,
        starRating,
        genre as BeatmapGenre,
        language as BeatmapLanguage
    );

    if (!allResults || !allResults.data)
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "Can't fetch beatmaps! Maybe there's no results."
                ),
            ],
        });

    const maximumResults = allResults.data.total;

    const randomPage = randomInt(maximumResults);

    const page = await osuApi.fetch.searchBeatmapset(
        "",
        mode,
        status,
        starRating,
        genre as BeatmapGenre,
        language as BeatmapLanguage,
        Math.round(randomPage / 50)
    );

    if (!page || !page.data)
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "Can't fetch beatmaps! Maybe there's no results."
                ),
            ],
        });

    const targetBeatmap =
        page.data.beatmapsets[
            Math.floor(Math.random() * page.data.beatmapsets.length)
        ];

    const resultsSelectMenu = new StringSelectMenuBuilder().setCustomId(
        `randombeatmap,${randomUUID()}`
    );

    page.data.beatmapsets.forEach((b, i) => {
        if (i < 25)
            resultsSelectMenu.addOptions({
                label: `#${i + 1}`,
                description: truncateString(
                    `${b.artist} - ${b.title} by ${b.creator}`,
                    100,
                    true
                ),
                value: `${b.id}`,
            });
    });

    await BeatmapsetEmbed.send(
        targetBeatmap,
        null,
        "",
        command,
        [],
        resultsSelectMenu
    );
});

export default randomBeatmap;
