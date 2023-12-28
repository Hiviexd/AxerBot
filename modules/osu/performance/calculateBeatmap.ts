import { BeatmapDecoder } from "osu-parsers";
import {
    DifficultyAttributes,
    HitResult,
    ModCombination,
    PerformanceAttributes,
    RulesetBeatmap,
    ScoreInfo,
} from "osu-classes";
import { generateHitStatistics } from "./generateHitStatistics";
import { createBeatmapInfo } from "./createBeatmapInfo";
import { calculateAccuracy } from "./calculateAccuracy";
import { getRulesetById } from "./getRuleset";

export interface BeatmapCalculationResult {
    beatmap: RulesetBeatmap;
    difficulty: DifficultyAttributes;
    performanceAttributes: PerformanceAttributes;
    performance: BeatmapPerformance[];
}

interface BeatmapPerformance {
    pp: number;
    acc: number;
}

export function multiplayDifficultyParameter(
    parameter: number,
    mods: ModCombination,
    rate?: number
) {
    const calc = parameter * (rate || 1);

    if (calc > 11 && mods.has("DTHR")) return 11;
    if (calc > 10) return 10;
    if (calc < 0) return 0;
    return calc;
}

export function calculateOsuBeatmap(osu_file: string, mods?: string) {
    return calculateBeatmap(osu_file, 0, mods);
}

export function calculateTaikoBeatmap(osu_file: string, mods?: string) {
    return calculateBeatmap(osu_file, 1, mods);
}

export function calculateFruitsBeatmap(osu_file: string, mods?: string) {
    return calculateBeatmap(osu_file, 2, mods);
}

export function calculateManiaBeatmap(osu_file: string, mods?: string) {
    return calculateBeatmap(osu_file, 3, mods);
}

export function generateRulesetBeatmap(osu_file: string, rulesetId: number, mods?: string) {
    const decoder = new BeatmapDecoder();
    const ruleset = getRulesetById(rulesetId);

    const parsed = decoder.decodeFromString(osu_file);
    const combination = ruleset.createModCombination(mods);

    const beatmap = ruleset.applyToBeatmapWithMods(parsed, combination);

    return beatmap;
}

function getHitResultFromString(hitTypeString: string) {
    const hits = {
        0: HitResult.None,
        1: HitResult.Miss,
        2: HitResult.Meh,
        3: HitResult.Ok,
        4: HitResult.Good,
        5: HitResult.Great,
        6: HitResult.Perfect,
        7: HitResult.SmallTickMiss,
        8: HitResult.SmallTickHit,
        9: HitResult.LargeTickMiss,
        10: HitResult.LargeTickHit,
        11: HitResult.SmallBonus,
        12: HitResult.LargeBonus,
        13: HitResult.IgnoreMiss,
        14: HitResult.IgnoreHit,
    } as { [key: string | number]: HitResult };

    return hits[hitTypeString];
}

export function calculateBeatmap(
    osu_file: string,
    rulesetId: number,
    mods?: string,
    rate?: number
) {
    const decoder = new BeatmapDecoder();
    const ruleset = getRulesetById(rulesetId);

    const parsed = decoder.decodeFromString(osu_file);
    const combination = ruleset.createModCombination(mods);

    const beatmap = ruleset.applyToBeatmapWithMods(parsed, combination);
    const difficultyCalculator = ruleset.createDifficultyCalculator(beatmap);
    const difficulty = difficultyCalculator.calculateWithMods(combination, rate);

    const scoreInfo = new ScoreInfo();
    const accuracy = [100, 99, 98, 95];

    const performance = accuracy.map((acc) => {
        try {
            scoreInfo.maxCombo = beatmap.maxCombo;
            scoreInfo.rulesetId = ruleset.id;
            scoreInfo.beatmap = createBeatmapInfo(beatmap);

            const hits = generateHitStatistics({
                accuracy: acc,
                beatmap,
            }) as { [key: string]: number };

            const hitResults = Object.keys(hits);

            for (const hit of hitResults) {
                scoreInfo.statistics.set(getHitResultFromString(hit), hits[hit]);
            }

            scoreInfo.mods = combination;
            scoreInfo.accuracy = calculateAccuracy(scoreInfo);

            const performanceCalculator = ruleset.createPerformanceCalculator(
                difficulty,
                scoreInfo
            );

            performanceCalculator.calculateAttributes(difficulty, scoreInfo);

            const pp = Math.round(performanceCalculator.calculate());

            return { pp, acc };
        } catch (e) {
            return { pp: 0, acc };
        }
    }) as BeatmapPerformance[];

    const performanceAttributes = ruleset.createPerformanceCalculator(difficulty);

    return {
        beatmap,
        difficulty,
        performanceAttributes: performanceAttributes.calculateAttributes(difficulty),
        performance,
    } as BeatmapCalculationResult;
}
