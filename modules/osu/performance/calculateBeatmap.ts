import { BeatmapDecoder } from "osu-parsers";
import {
    DifficultyAttributes,
    ModCombination,
    PerformanceAttributes,
    RulesetBeatmap,
    ScoreInfo,
} from "osu-classes";
import { createBeatmapInfo } from "@kionell/osu-pp-calculator";
import { generateHitStatistics } from "./generateHitStatistics";
import { getRulesetById } from "./getRuleset";
import { GameMode } from "../../../types/game_mode";

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
    return calculateBeatmap(osu_file, GameMode.osu, mods);
}

export function calculateTaikoBeatmap(osu_file: string, mods?: string) {
    return calculateBeatmap(osu_file, GameMode.taiko, mods);
}

export function calculateFruitsBeatmap(osu_file: string, mods?: string) {
    return calculateBeatmap(osu_file, GameMode.fruits, mods);
}

export function calculateManiaBeatmap(osu_file: string, mods?: string) {
    return calculateBeatmap(osu_file, GameMode.mania, mods);
}

export function generateRulesetBeatmap(osu_file: string, rulesetId: GameMode, mods?: string) {
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
    const difficulty = difficultyCalculator.calculateWithMods(combination, rate);

    const accuracy = [100, 99, 98, 95];

    const performance = accuracy.map((acc) => {
        try {
            const hits = generateHitStatistics({
                accuracy: acc,
                beatmap,
            });

            const scoreInfo = new ScoreInfo({
                statistics: hits,
                mods: combination,
            });

            scoreInfo.maxCombo = beatmap.maxCombo;
            scoreInfo.rulesetId = ruleset.id;
            scoreInfo.beatmap = createBeatmapInfo(beatmap);
            scoreInfo.mods = combination;

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
