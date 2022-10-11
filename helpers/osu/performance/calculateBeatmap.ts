import { BeatmapDecoder } from "osu-parsers";
import { DifficultyAttributes, RulesetBeatmap, ScoreInfo } from "osu-classes";
import { generateHitStatistics } from "./generateHitStatistics";
import { createBeatmapInfo } from "./createBeatmapInfo";
import { calculateAccuracy } from "./calculateAccuracy";
import { getRulesetById } from "./getRuleset";

interface BeatmapCalculationResult {
	beatmap: RulesetBeatmap;
	difficulty: DifficultyAttributes;
	performance: BeatmapPerformance[];
}

interface BeatmapPerformance {
  pp: number;
  acc: number;
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

function calculateBeatmap(osu_file: string, rulesetId: number, mods?: string) {
	const decoder = new BeatmapDecoder();
	const ruleset = getRulesetById(rulesetId);
	
	const parsed = decoder.decodeFromString(osu_file);	
	const combination = ruleset.createModCombination(mods);
	
	const beatmap = ruleset.applyToBeatmapWithMods(parsed, combination);
	const difficultyCalculator = ruleset.createDifficultyCalculator(beatmap);
	const difficulty = difficultyCalculator.calculateWithMods(combination);

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
		scoreInfo.accuracy = calculateAccuracy(scoreInfo);

		const performanceCalculator = ruleset.createPerformanceCalculator(
			difficulty,
			scoreInfo,
		);

		const pp = Math.round(performanceCalculator.calculate());

		return { pp, acc };
	}) as BeatmapPerformance[];

	return {
		beatmap,
		difficulty,
		performance,
	} as BeatmapCalculationResult;
};
