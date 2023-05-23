import { BeatmapDecoder } from "osu-parsers";
import {
    DifficultyAttributes,
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

export function multiplayDifficultyParameter(parameter: number, rate: number) {
    return parameter * rate;
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

export function generateRulesetBeatmap(
    osu_file: string,
    rulesetId: number,
    mods?: string
) {
    const decoder = new BeatmapDecoder();
    const ruleset = getRulesetById(rulesetId);

    const parsed = decoder.decodeFromString(osu_file);
    const combination = ruleset.createModCombination(mods);

    const beatmap = ruleset.applyToBeatmapWithMods(parsed, combination);

    return beatmap;
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
    const difficulty = difficultyCalculator.calculateWithMods(
        combination,
        rate
    );

    const scoreInfo = new ScoreInfo();
    const accuracy = [100, 99, 98, 95];

    const performance = accuracy.map((acc) => {
        scoreInfo.maxCombo = beatmap.maxCombo;
        scoreInfo.rulesetId = ruleset.id;
        scoreInfo.beatmap = createBeatmapInfo(beatmap);
        scoreInfo.statistics = generateHitStatistics({
            accuracy: acc,
            beatmap,
        });
        scoreInfo.mods = combination;
        scoreInfo.accuracy = calculateAccuracy(scoreInfo);

        const performanceCalculator = ruleset.createPerformanceCalculator(
            difficulty,
            scoreInfo
        );

        performanceCalculator.calculateAttributes(difficulty, scoreInfo);

        const pp = Math.round(performanceCalculator.calculate());

        return { pp, acc };
    }) as BeatmapPerformance[];

    const performanceAttributes =
        ruleset.createPerformanceCalculator(difficulty);

    return {
        beatmap,
        difficulty,
        performanceAttributes:
            performanceAttributes.calculateAttributes(difficulty),
        performance,
    } as BeatmapCalculationResult;
}
