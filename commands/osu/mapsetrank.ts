import { SlashCommand } from "../../models/commands/SlashCommand";
import osuApi from "../../modules/osu/fetcher/osuApi";
import { calculateScoreForBeatmapset } from "../../modules/osu/performance/calculateMapperScore";
import checkCommandPlayers from "../../modules/osu/player/checkCommandPlayers";
import UserNotFound from "../../responses/embeds/UserNotFound";
import UserNotMapper from "../../responses/embeds/UserNotMapper";
import MapsetRankEmbed from "../../responses/osu/MapsetRankEmbed";
import { Beatmapset } from "../../types/beatmap";

const mapsetrank = new SlashCommand(
    ["mapsetrank", "mr"],
    "Displays beatmapset statistics of a user",
    "osu!",
    true,
    {
        example: "/mapsetrank `username:Hivie` `sort:favorites`\n/mapsetrank",
        note: "You won't need to specify your username if you set yourself up with this command:\n`/osuset user <username>`",
    }
);

mapsetrank.builder
    .addStringOption((o) => o.setName("username").setDescription("Mapper username"))
    .addStringOption((o) =>
        o.setName("sort").setDescription("Generate a leaderboard with beatmaps:").addChoices(
            {
                name: "performance",
                value: "performance",
            },
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

mapsetrank.setExecuteFunction(async (command) => {
    let sort = command.options.get("sort") ? command.options.get("sort")?.value : "performance";

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

    const totalMapped =
        mapper.data.ranked_and_approved_beatmapset_count +
        mapper.data.loved_beatmapset_count +
        mapper.data.pending_beatmapset_count +
        mapper.data.graveyard_beatmapset_count;

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
        case "performance": {
            sorted_beatmaps.sort((a, b) => {
                return (
                    calculateScoreForBeatmapset(b, totalMapped) -
                    calculateScoreForBeatmapset(a, totalMapped)
                );
            });

            decorator = {
                title: "Beatmap performance top", // ? {username} | Most played beatmaps
                emoji: "📈", // ? {position} . {beatmap_link} | ▶
            };

            break;
        }
    }

    MapsetRankEmbed.reply(mapper, sorted_beatmaps, command, decorator);
});

export default mapsetrank;
