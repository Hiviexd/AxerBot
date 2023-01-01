import { BeatmapDecoder } from "osu-parsers";
import { ModCombination, RulesetBeatmap, ScoreInfo } from "osu-classes";
import { createBeatmapInfo } from "./createBeatmapInfo";
import { calculateAccuracy } from "./calculateAccuracy";
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
	return calculateScore(osu_file, 0, score);
}

export function calculateTaikoScore(osu_file: string, score: Score) {
	return calculateScore(osu_file, 1, score);
}

export function calculateFruitsScore(osu_file: string, score: Score) {
	return calculateScore(osu_file, 2, score);
}

export function calculateManiaScore(osu_file: string, score: Score) {
	return calculateScore(osu_file, 3, score);
}

export function calculateScore(
	osu_file: string,
	rulesetId: number,
	score: Score
) {
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
			? difficultyCalculator.calculateWithModsAt(
					combination,
					scoreInfo.totalHits
			  )
			: difficultyCalculator.calculateWithMods(combination);

	const performance = performanceCalculator.calculate(difficulty, scoreInfo);

	const fcScoreInfo = simulateFC(beatmap, scoreInfo);
	const fcDifficulty =
		scoreInfo.totalHits !== beatmapInfo.totalHits
			? difficultyCalculator.calculateWithMods(combination)
			: difficulty;

	const fcPerformance = performanceCalculator.calculate(
		fcDifficulty,
		fcScoreInfo
	);

	return {
		pp: Math.round(performance),
		fc: Math.round(fcPerformance),
		fcAcc: fcScoreInfo.accuracy,
		accuracy: scoreInfo.accuracy,
		maxCombo: fcDifficulty.maxCombo,
		starRating: fcDifficulty.starRating,
	} as ScorePerformance;
}

export function generateScoreInfo(
	osu_file: string,
	rulesetId: number,
	score: Score
) {
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

export function simulateFC(
	beatmap: RulesetBeatmap,
	scoreInfo: ScoreInfo
): ScoreInfo {
	const newScoreInfo = scoreInfo.clone();
	const statistics = newScoreInfo.statistics;
	const totalHits = getTotalHits(beatmap);

	switch (scoreInfo.rulesetId) {
		case GameMode.fruits:
			statistics.great =
				totalHits -
				statistics.largeTickHit -
				statistics.smallTickHit -
				statistics.smallTickMiss -
				statistics.miss;

			statistics.largeTickHit += statistics.miss;

			break;

		case GameMode.mania:
			statistics.perfect =
				totalHits -
				statistics.great -
				statistics.good -
				statistics.ok -
				statistics.meh;

			break;

		default:
			statistics.great = totalHits - statistics.ok - statistics.meh;
	}

	statistics.miss = 0;

	newScoreInfo.maxCombo = beatmap.maxCombo;
	newScoreInfo.accuracy = calculateAccuracy(newScoreInfo);
	newScoreInfo.perfect = true;
	newScoreInfo.passed = true;

	return newScoreInfo;
}
