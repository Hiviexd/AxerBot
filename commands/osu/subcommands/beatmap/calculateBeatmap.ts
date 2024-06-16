import { SlashCommandStringOption } from "discord.js";
import generateErrorEmbedWithTitle from "../../../../helpers/text/embeds/generateErrorEmbedWithTitle";
import { parseOsuBeatmapURL } from "../../../../helpers/text/parseOsuBeatmapURL";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import osuApi from "../../../../modules/osu/fetcher/osuApi";
import BeatmapsetEmbed from "../../../../responses/osu/BeatmapsetEmbed";

const calculateBeatmap = new SlashCommandSubcommand()
    .setName("calculate")
    .setDescription("Calculate performance statistics of a beatmap")
    .addOptions(
        new SlashCommandStringOption()
            .setName("beatmap_url")
            .setDescription("Beatmap URL to fetch")
            .setRequired(true),
        new SlashCommandStringOption()
            .setName("mode")
            .setDescription("Select mode for converted beatmaps")
            .addChoices(
                {
                    name: "osu!",
                    value: "osu",
                },
                {
                    name: "osu!taiko",
                    value: "taiko",
                },
                {
                    name: "osu!catch",
                    value: "fruits",
                },
                {
                    name: "osu!mania",
                    value: "mania",
                }
            )
    );

calculateBeatmap.setExecutable(async (command) => {
    const beatmapParameters = parseOsuBeatmapURL(command.options.getString("beatmap_url", true));

    const mode = command.options.getString("mode");

    if (
        beatmapParameters.error ||
        !beatmapParameters.data ||
        (!beatmapParameters.data.beatmap_id && !beatmapParameters.data.beatmapset_id)
    )
        return command.editReply({
            embeds: [
                generateErrorEmbedWithTitle(
                    "Invalid beatmap URL!",
                    `\`${command.options.getString(
                        "beatmap_url",
                        true
                    )}\` isn't an osu! beatmap URL!`
                ),
            ],
        });

    if (beatmapParameters.data.beatmap_id && !beatmapParameters.data.beatmapset_id) {
        const beatmapData = await osuApi.fetch.beatmap(beatmapParameters.data.beatmap_id);

        if (!beatmapData || !beatmapData.data || beatmapData.status != 200)
            return command.editReply({
                embeds: [
                    generateErrorEmbedWithTitle(
                        "Invalid beatmap URL!",
                        `\`${command.options.getString(
                            "beatmap_url",
                            true
                        )}\` is invalid! I can't find this beatmap.`
                    ),
                ],
            });

        const beatmapsetData = await osuApi.fetch.beatmapset(
            beatmapData.data.beatmapset_id.toString()
        );

        if (!beatmapsetData || !beatmapsetData.data || beatmapsetData.status != 200)
            return command.editReply({
                embeds: [
                    generateErrorEmbedWithTitle(
                        "Invalid beatmap URL!",
                        `\`${command.options.getString(
                            "beatmap_url",
                            true
                        )}\` is invalid! I can't find this beatmap.`
                    ),
                ],
            });

        return BeatmapsetEmbed.send(
            beatmapsetData.data,
            beatmapParameters.data.beatmap_id,
            mode || "",
            command
        );
    }

    if (beatmapParameters.data.beatmapset_id) {
        const beatmapsetData = await osuApi.fetch.beatmapset(beatmapParameters.data.beatmapset_id);

        if (!beatmapsetData || !beatmapsetData.data || beatmapsetData.status != 200)
            return command.editReply({
                embeds: [
                    generateErrorEmbedWithTitle(
                        "Invalid beatmap URL!",
                        `\`${command.options.getString(
                            "beatmap_url",
                            true
                        )}\` is invalid! I can't find this beatmap.`
                    ),
                ],
            });

        return BeatmapsetEmbed.send(
            beatmapsetData.data,
            beatmapParameters.data.beatmap_id,
            mode || "",
            command
        );
    }

    return command.editReply({
        embeds: [
            generateErrorEmbedWithTitle(
                "Invalid beatmap URL!",
                `\`${command.options.getString(
                    "beatmap_url",
                    true
                )}\` is invalid! I can't find this beatmap.`
            ),
        ],
    });
});

export { calculateBeatmap };
