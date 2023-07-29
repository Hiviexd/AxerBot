import { Beatmapset } from "../../../types/beatmap";

function calculateBeatmapPlaycount(beatmapset: Beatmapset) {
    let total = 0;

    if (!beatmapset.beatmaps) return 0;

    for (const map of beatmapset.beatmaps) {
        if (map.user_id == beatmapset.user_id) total += map.playcount;
    }

    return total;
}

export function calculateScoreForBeatmapset(beatmapset: Beatmapset, userBeatmapsetsCount: number) {
    const Playcount = calculateBeatmapPlaycount(beatmapset);
    const Favorites = beatmapset.favourite_count;
    const ScaleFactor = 0.5;

    if (!["ranked", "loved", "approved"].includes(beatmapset.status)) return 0;

    return ((ScaleFactor * Playcount) ^ (0.83 * Favorites)) / (1 + userBeatmapsetsCount);
}

export function calculateMapperScore(maps: Beatmapset[]) {
    const allScores = maps.map((b) => {
        return {
            beatmapset: b,
            score: calculateScoreForBeatmapset(b, maps.length),
        };
    });

    let total = 0;

    for (const score of allScores) {
        total += score.score;
    }

    return {
        total,
        all: allScores,
    };
}
