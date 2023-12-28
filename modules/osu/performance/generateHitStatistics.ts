import { RulesetBeatmap, MathUtils, HitStatistics, HitResult } from "osu-classes";
import { countDroplets, countFruits, countHittable, countTinyDroplets, getTotalHits } from "./calculateHits";
import { GameMode } from "../../../types/game_mode";

interface IHitStatisticsInput {
    beatmap: RulesetBeatmap;
    accuracy?: number;
    countMiss?: number;
    count50?: number;
    count100?: number;
    count300?: number;
    countKatu?: number;
}

export function generateHitStatistics(options: IHitStatisticsInput) {
    switch (options.beatmap.mode) {
        case GameMode.taiko:
            return generateTaikoHitStatistics(options);

        case GameMode.fruits:
            return generateCatchHitStatistics(options);

        case GameMode.mania:
            return generateManiaHitStatistics(options);
    }

    return generateOsuHitStatistics(options);
}

function generateOsuHitStatistics(options: IHitStatisticsInput): HitStatistics {
    const beatmap = options.beatmap;
    const accuracy = getAccuracy(options);
    const totalHits = getTotalHits(beatmap);

    let count50 = options.count50;
    let count100 = options.count100;
    let countMiss = options.countMiss ?? 0;

    countMiss = MathUtils.clamp(countMiss, 0, totalHits);
    count50 = count50 ? MathUtils.clamp(count50, 0, totalHits - countMiss) : 0;

    count100 =
        typeof count100 !== "number"
            ? Math.round((totalHits - totalHits * accuracy) * 1.5)
            : MathUtils.clamp(count100, 0, totalHits - count50 - countMiss);

    const count300 = totalHits - count100 - count50 - countMiss;

    return new HitStatistics([
        [HitResult.Great, count300],
        [HitResult.Ok, count100],
        [HitResult.Meh, count50],
        [HitResult.Miss, countMiss],
    ]);
}

function generateTaikoHitStatistics(options: IHitStatisticsInput): HitStatistics {
    const beatmap = options.beatmap;
    const accuracy = getAccuracy(options);
    const totalHits = getTotalHits(beatmap);

    let count100 = options.count100;
    let countMiss = options.countMiss ?? 0;

    countMiss = MathUtils.clamp(countMiss, 0, totalHits);

    let count300;

    if (typeof count100 !== "number") {
        const targetTotal = Math.round(accuracy * totalHits * 2);

        count300 = targetTotal - (totalHits - countMiss);
        count100 = totalHits - count300 - countMiss;
    } else {
        count100 = MathUtils.clamp(count100, 0, totalHits - countMiss);
        count300 = totalHits - count100 - countMiss;
    }

    return new HitStatistics([
        [HitResult.Great, count300],
        [HitResult.Ok, count100],
        [HitResult.Miss, countMiss],
    ]);
}

function generateCatchHitStatistics(options: IHitStatisticsInput): HitStatistics {
    const beatmap = options.beatmap;
    const accuracy = getAccuracy(options);
    const count50 = options.count50;
    const count100 = options.count100;

    let countMiss = options.countMiss ?? 0;

    const maxCombo = beatmap.maxCombo ?? 0;
    const maxTinyDroplets = countTinyDroplets(beatmap);
    const maxDroplets = countDroplets(beatmap) - maxTinyDroplets;
    const maxFruits = countFruits(beatmap) + countHittable(beatmap);

    if (typeof count100 === "number") {
        countMiss += maxDroplets - count100;
    }

    countMiss = MathUtils.clamp(countMiss, 0, maxDroplets + maxFruits);

    let droplets = count100 ?? Math.max(0, maxDroplets - countMiss);

    droplets = MathUtils.clamp(droplets, 0, maxDroplets);

    const fruits = maxFruits - (countMiss - (maxDroplets - droplets));

    let tinyDroplets = Math.round(accuracy * (maxCombo + maxTinyDroplets));

    tinyDroplets = count50 ?? tinyDroplets - fruits - droplets;

    const tinyMisses = maxTinyDroplets - tinyDroplets;

    return new HitStatistics([
        [HitResult.Great, MathUtils.clamp(fruits, 0, maxFruits)],
        [HitResult.LargeTickHit, MathUtils.clamp(droplets, 0, maxDroplets)],
        [HitResult.SmallTickHit, tinyDroplets],
        [HitResult.SmallTickMiss, tinyMisses],
        [HitResult.Miss, countMiss],
    ]);
}

function generateManiaHitStatistics(options: IHitStatisticsInput): HitStatistics {
    // Accuracy = (n50 / 6 + n100 / 3 + katu / 1.5 + (n300 + geki)) / total

    const beatmap = options.beatmap;
    const accuracy = getAccuracy(options);
    const totalHits = getTotalHits(beatmap);

    let count300 = options.count300 ?? 0;
    let countKatu = options.countKatu ?? 0; // Goods (200)
    let count100 = options.count100 ?? 0;
    let count50 = options.count50;
    let countMiss = options.countMiss ?? 0;

    countMiss = MathUtils.clamp(countMiss, 0, totalHits);

    let currentCounts = countMiss;

    if (typeof count50 === "number" || typeof options.accuracy !== "number") {
        count50 = count50 ? MathUtils.clamp(count50, 0, totalHits - currentCounts) : 0;
    } else {
        /**
         * Acc = 0.98, Total = 1000
         *
         * n50 / 6 + n100 / 3 + katu / 1.5 + n300 + geki = Acc * Total = 980
         * n50 + n100 + katu + n300 + geki = 1000
         *
         * 5 * n50 / 6 + 2 * n100 / 3 + katu / 3 = 20
         *
         * n50 = 1.2 * (20 - 2 * n100 / 3 - katu / 3)
         *
         * n50 = 24 - 0.8 * n100 - 0.4 * katu
         */
        count50 = (totalHits - totalHits * accuracy) * 1.2;

        count50 = Math.round(count50 - 0.8 * count100 - 0.4 * countKatu);
    }

    currentCounts += count50;

    count100 = MathUtils.clamp(count100, 0, totalHits - currentCounts);

    currentCounts += count100;

    countKatu = MathUtils.clamp(countKatu, 0, totalHits - currentCounts);

    currentCounts += countKatu;

    count300 = MathUtils.clamp(count300, 0, totalHits - currentCounts);

    currentCounts += count300;

    const countGeki = totalHits - count300 - countKatu - count100 - count50 - countMiss;

    return new HitStatistics([
        [HitResult.Perfect, countGeki],
        [HitResult.Great, count300],
        [HitResult.Good, countKatu],
        [HitResult.Ok, count100],
        [HitResult.Meh, count50],
        [HitResult.Miss, countMiss],
    ]);
}

function getAccuracy(options: IHitStatisticsInput): number {
    if (typeof options.accuracy !== "number") return 1;

    if (options.accuracy > 1) return options.accuracy / 100;

    return options.accuracy;
}
