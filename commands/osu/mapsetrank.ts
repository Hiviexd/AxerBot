import { SlashCommandStringOption } from "discord.js";
import { SlashCommand } from "../../models/commands/SlashCommand";
import osuApi from "../../modules/osu/fetcher/osuApi";
import checkCommandPlayers from "../../modules/osu/player/checkCommandPlayers";
import UserNotFound from "../../responses/embeds/UserNotFound";
import UserNotMapper from "../../responses/embeds/UserNotMapper";
import MapsetRankEmbed from "../../responses/osu/MapsetRankEmbed";
import { Beatmapset } from "../../types/beatmap";
import { CommandCategory } from "../../struct/commands/CommandCategory";

const mapsetrank = new SlashCommand()
    .setName("mapranking")
    .setNameAliases(["mr"])
    .setDescription("Display a ranking of played/favorited beatmaps of an user")
    .setDMPermission(true)
    .setCategory(CommandCategory.Osu)
    .addOptions(
        new SlashCommandStringOption().setName("username").setDescription("Mapper username"),
        new SlashCommandStringOption()
            .setName("sort")
            .setDescription("Generate a leaderboard with beatmaps:")
            .addChoices(
                {
                    name: "favorites",
                    value: "favourite_count",
                },
                {
                    name: "plays",
                    value: "play_count",
                }
            )
    );

mapsetrank.setExecutable(async (command) => {
    let sort = command.options.get("sort") ? command.options.get("sort")?.value : "play_count";

    let decorator = {
        title: "Most played beatmaps", // ? {username} | Most played beatmaps
        emoji: "▶", // ? {position} . {beatmap_link} | ▶
    };

    let { playerName, status } = await checkCommandPlayers(command);

    if (status != 200) return;

    const mapper = await osuApi.fetch.user(encodeURI(playerName));

    if (mapper.status != 200)
        return command.editReply({
            embeds: [UserNotFound],
        });

    const beatmaps = await osuApi.fetch.userBeatmaps(mapper.data.id.toString());

    if (beatmaps.status != 200) return;

    if (beatmaps.data.sets.length < 1)
        return command.editReply({
            embeds: [UserNotMapper],
        });

    // ? Sort beatmaps
    const sorted_beatmaps: Beatmapset[] = beatmaps.data.sets;
    switch (sort) {
        case "favourite_count": {
            sorted_beatmaps.sort((a, b) => {
                return Number(b.favourite_count) - Number(a.favourite_count);
            });

            decorator = {
                title: "Most favorited beatmaps", // ? {username} | Most played beatmaps
                emoji: "❤", // ? {position} . {beatmap_link} | ▶
            };

            break;
        }
        case "play_count": {
            sorted_beatmaps.sort((a, b) => {
                return Number(b.play_count) - Number(a.play_count);
            });

            break;
        }
    }

    MapsetRankEmbed.reply(mapper, sorted_beatmaps, command, decorator);
});

export { mapsetrank };
