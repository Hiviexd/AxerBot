import osuApi from "../../modules/osu/fetcher/osuApi";
import generateErrorEmbedWithTitle from "../../helpers/text/embeds/generateErrorEmbedWithTitle";
import { parseOsuBeatmapURL } from "../../helpers/text/parseOsuBeatmapURL";
import { SlashCommand } from "../../models/commands/SlashCommand";
import BeatmapsetEmbed from "../../responses/osu/BeatmapsetEmbed";

const map = new SlashCommand(
    ["map", "calculate"],
    "Send beatmap info of a beatmap with pp",
    "osu!",
    true
);

map.builder
    .addStringOption((o) =>
        o
            .setName("beatmap_url")
            .setDescription("Beatmap URL to fetch")
            .setRequired(true)
    )
    .addStringOption((o) =>
        o
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

map.setExecuteFunction(async (command) => {
    const beatmapParameters = parseOsuBeatmapURL(
        command.options.getString("beatmap_url", true)
    );

    const mode = command.options.getString("mode");

    if (
        beatmapParameters.error ||
        !beatmapParameters.data ||
        (!beatmapParameters.data.beatmap_id &&
            !beatmapParameters.data.beatmapset_id)
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

    if (
        beatmapParameters.data.beatmap_id &&
        !beatmapParameters.data.beatmapset_id
    ) {
        const beatmapData = await osuApi.fetch.beatmap(
            beatmapParameters.data.beatmap_id
        );

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

        if (
            !beatmapsetData ||
            !beatmapsetData.data ||
            beatmapsetData.status != 200
        )
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
        const beatmapsetData = await osuApi.fetch.beatmapset(
            beatmapParameters.data.beatmapset_id
        );

        if (
            !beatmapsetData ||
            !beatmapsetData.data ||
            beatmapsetData.status != 200
        )
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

export default map;
