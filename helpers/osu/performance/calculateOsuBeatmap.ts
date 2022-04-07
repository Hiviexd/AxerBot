import { BeatmapDecoder } from "osu-parsers";
import { StandardRuleset } from "osu-standard-stable";
import { ScoreInfo, BeatmapInfo } from "osu-classes";
import calculateHits from "./calculateHits";

export default (osu_file: string, mods?: string) => {
	const decoder = new BeatmapDecoder();
	const parsed = decoder.decodeFromString(osu_file);
	const ruleset = new StandardRuleset();

	mods ||= "NM";

	// ? Result
	let result: any[] = [];

	const _mods = ruleset.createModCombination(mods);
	const stdBeatmap = ruleset.applyToBeatmapWithMods(parsed, _mods);
	const map = ruleset.createDifficultyCalculator(stdBeatmap);

	const beatmapDifficulty = map.calculate();

	const score = new ScoreInfo();
	const mapInfo = new BeatmapInfo(stdBeatmap);
	const accs = [100, 99, 98, 95];

	accs.forEach((acc) => {
		const hits = calculateHits(acc, stdBeatmap.maxCombo);

		score.beatmap = mapInfo;
		score.maxCombo = stdBeatmap.maxCombo;
		score.statistics.great = hits.n300;
		score.statistics.ok = hits.n100;
		score.statistics.meh = 0;
		score.statistics.good = 0;
		score.statistics.miss = 0;
		score.accuracy =
			(score.statistics.great + score.statistics.ok / 2) /
			(score.statistics.great +
				score.statistics.ok +
				score.statistics.miss);

		const performanceCalculator = ruleset.createPerformanceCalculator(
			beatmapDifficulty,
			score
		);

		const pp = performanceCalculator.calculate();

		result.push({ pp: Math.round(pp), acc: acc });
	});

	return result;
};
