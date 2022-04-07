import { BeatmapDecoder } from "osu-parsers";
import { TaikoRuleset } from "osu-taiko-stable";
import { ScoreInfo } from "osu-classes";
import calculateHits from "./calculateHits";

export default (osu_file: string, mods?: string) => {
	const decoder = new BeatmapDecoder();

	const parsed = decoder.decodeFromString(osu_file);

	const ruleset = new TaikoRuleset();

	mods ? mods : (mods = "NM");

	const _mods = ruleset.createModCombination(mods);

	const taikoBeatmap: any = ruleset.applyToBeatmapWithMods(parsed, _mods);

	// Create difficulty calculator for osu!taiko beatmap.
	const difficultyCalculator =
		ruleset.createDifficultyCalculator(taikoBeatmap);

	// Calculate difficulty attributes.
	const difficultyAttributes = difficultyCalculator.calculate();

	const result: any = [];

	const accs = [100, 99, 98, 95];

	accs.forEach((acc) => {
		const score = new ScoreInfo();
		const hits = calculateHits(acc, taikoBeatmap.maxCombo);
		score.beatmap = taikoBeatmap;
		score.mods = _mods;
		score.maxCombo = taikoBeatmap.maxCombo;
		score.statistics.great = hits.n300;
		score.statistics.ok = hits.n100;
		score.statistics.miss = 0;

		score.accuracy =
			(score.statistics.great + score.statistics.ok / 2) /
			(score.statistics.great +
				score.statistics.ok +
				score.statistics.miss);

		const performanceCalculator = ruleset.createPerformanceCalculator(
			difficultyAttributes,
			score
		);

		const totalPerformance = performanceCalculator.calculate();

		result.push({ pp: Math.round(totalPerformance), acc: acc });

		return result;
	});

	return result;

	// // ? Result
	// let result: any[] = [];

	// const _mods = ruleset.createModCombination(mods);
	// const taikoBeatmap: any = ruleset.applyToBeatmapWithMods(parsed, _mods);
	// const map = ruleset.createDifficultyCalculator(taikoBeatmap);

	// const beatmapDifficulty = map.calculate();
	// const accs = [100, 99, 98, 95];

	// accs.forEach((acc) => {
	// 	const hits = calculateHits(acc, taikoBeatmap.maxCombo);
	// 	const score = new ScoreInfo();
	// 	score.mods = _mods;
	// 	score.beatmap = taikoBeatmap;
	// 	score.maxCombo = taikoBeatmap.maxCombo;
	// 	score.statistics.great = hits.n300;
	// 	score.statistics.ok = hits.n100;
	// 	score.statistics.miss = 0;
	// 	score.accuracy =
	// 		(score.statistics.great + score.statistics.ok / 2) /
	// 		(score.statistics.great +
	// 			score.statistics.ok +
	// 			score.statistics.miss);

	// 	const performanceCalculator = ruleset.createPerformanceCalculator(
	// 		beatmapDifficulty,
	// 		score
	// 	);

	// 	const pp = performanceCalculator.calculate();

	// 	result.push({ pp: Math.round(pp), acc: acc });
	// });

	return result;
};
