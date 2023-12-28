import { BeatmapDecoder } from "osu-parsers";
import { HitResult, RulesetBeatmap, ScoreInfo } from "osu-classes";
import { createBeatmapInfo } from "@kionell/osu-pp-calculator";
import { getRulesetById } from "./getRuleset";
import { Score } from "../../../types/score";
import { getTotalHits } from "./calculateHits";
import { GameMode } from "../../../types/game_mode";

interface ScorePerformance {
    pp: number;
    fc: number;
    fcAcc: number;
    accuracy: number;
    starRating: number;
    maxCombo: number;
}

export function calculateOsuScore(osu_file: string, score: Score) {
    return calculateScore(osu_file, GameMode.osu, score);
}

export function calculateTaikoScore(osu_file: string, score: Score) {
    return calculateScore(osu_file, GameMode.taiko, score);
}

export function calculateFruitsScore(osu_file: string, score: Score) {
    return calculateScore(osu_file, GameMode.fruits, score);
}

export function calculateManiaScore(osu_file: string, score: Score) {
    return calculateScore(osu_file, GameMode.mania, score);
}

export function calculateScore(osu_file: string, rulesetId: GameMode, score: Score) {
    const decoder = new BeatmapDecoder();
    const ruleset = getRulesetById(rulesetId);

    const parsed = decoder.decodeFromString(osu_file);
    const combination = ruleset.createModCombination(score.mods?.join(""));

    const beatmap = ruleset.applyToBeatmapWithMods(parsed, combination);
    const difficultyCalculator = ruleset.createDifficultyCalculator(beatmap);
    const performanceCalculator = ruleset.createPerformanceCalculator();
    const beatmapInfo = createBeatmapInfo(beatmap);

    const scoreInfo = new ScoreInfo({
        beatmap: beatmapInfo,
        mods: beatmap.mods,
        rulesetId: ruleset.id,
        accuracy: score.accuracy,
        maxCombo: score.max_combo,
        countGeki: score.statistics.count_geki,
        count300: score.statistics.count_300,
        countKatu: score.statistics.count_katu,
        count100: score.statistics.count_100,
        count50: score.statistics.count_50,
        countMiss: score.statistics.count_miss,
    });

    const difficulty =
        scoreInfo.totalHits !== beatmapInfo.totalHits
            ? difficultyCalculator.calculateWithModsAt(combination, scoreInfo.totalHits)
            : difficultyCalculator.calculateWithMods(combination);

    const performance = performanceCalculator.calculate(difficulty, scoreInfo);

    const fcScoreInfo = simulateFC(beatmap, scoreInfo);
    const fcDifficulty =
        scoreInfo.totalHits !== beatmapInfo.totalHits
            ? difficultyCalculator.calculateWithMods(combination)
            : difficulty;

    const fcPerformance = performanceCalculator.calculate(fcDifficulty, fcScoreInfo);

    return {
        pp: Math.round(performance),
        fc: Math.round(fcPerformance),
        fcAcc: fcScoreInfo.accuracy,
        accuracy: scoreInfo.accuracy,
        maxCombo: fcDifficulty.maxCombo,
        starRating: fcDifficulty.starRating,
    } as ScorePerformance;
}

export function generateScoreInfo(osu_file: string, rulesetId: number, score: Score) {
    const decoder = new BeatmapDecoder();
    const ruleset = getRulesetById(rulesetId);

    const parsed = decoder.decodeFromString(osu_file);
    const combination = ruleset.createModCombination(score.mods?.join(""));

    const beatmap = ruleset.applyToBeatmapWithMods(parsed, combination);

    const beatmapInfo = createBeatmapInfo(beatmap);

    const scoreInfo = new ScoreInfo({
        beatmap: beatmapInfo,
        mods: beatmap.mods,
        rulesetId: ruleset.id,
        accuracy: score.accuracy,
        maxCombo: score.max_combo,
        countGeki: score.statistics.count_geki,
        count300: score.statistics.count_300,
        countKatu: score.statistics.count_katu,
        count100: score.statistics.count_100,
        count50: score.statistics.count_50,
        countMiss: score.statistics.count_miss,
    });

    return scoreInfo;
}

export function simulateFC(beatmap: RulesetBeatmap, scoreInfo: ScoreInfo): ScoreInfo {
    const newScoreInfo = scoreInfo.clone();
    const statistics = newScoreInfo.statistics;
    const totalHits = getTotalHits(beatmap);

    switch (scoreInfo.rulesetId) {
        case GameMode.fruits: {
            const largeTickHit = statistics.get(HitResult.LargeTickHit);
            const smallTickHit = statistics.get(HitResult.SmallTickHit);
            const smallTickMiss = statistics.get(HitResult.SmallTickMiss);
            const miss = statistics.get(HitResult.Miss);

            statistics.set(
                HitResult.Great,
                totalHits - largeTickHit - smallTickHit - smallTickMiss - miss,
            );

            statistics.set(HitResult.LargeTickHit, largeTickHit + miss);

            break;
        }

        case GameMode.mania: {
            const great = statistics.get(HitResult.Great);
            const good = statistics.get(HitResult.Good);
            const ok = statistics.get(HitResult.Ok);
            const meh = statistics.get(HitResult.Meh);

            statistics.set(HitResult.Perfect, totalHits - great - good - ok - meh);

            break;
        }

        default: {
            const ok = statistics.get(HitResult.Ok);
            const meh = statistics.get(HitResult.Meh);

            statistics.set(HitResult.Great, totalHits - ok - meh);
        }
    }

    statistics.set(HitResult.Miss, 0);

    newScoreInfo.maxCombo = beatmap.maxCombo;
    newScoreInfo.perfect = true;
    newScoreInfo.passed = true;

    return newScoreInfo;
}
