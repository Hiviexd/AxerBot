import { BeatmapDecoder } from "osu-parsers";
import { TaikoRuleset } from "osu-taiko-stable";
import { ScoreInfo, BeatmapInfo } from "osu-classes";
import { Score } from "../../../types/score";

export default (osu_file: string, score: Score) => {
	const decoder = new BeatmapDecoder();
	const parsed = decoder.decodeFromString(osu_file);
	const ruleset = new TaikoRuleset();

	const _mods = ruleset.createModCombination(score.mods_int);
	const ctbBeatmap = ruleset.applyToBeatmapWithMods(parsed, _mods);
	const map = ruleset.createDifficultyCalculator(ctbBeatmap);

	const beatmapDifficulty = map.calculate();

	const _score = new ScoreInfo();
	const mapInfo = new BeatmapInfo(ctbBeatmap);

	_score.beatmap = mapInfo;
	_score.maxCombo = score.max_combo;
	_score.count300 = score.statistics.count_300 + score.statistics.count_geki;
	_score.count100 = score.statistics.count_100 + score.statistics.count_katu;
	_score.statistics.miss = score.statistics.count_miss;
	_score.accuracy = score.accuracy;

	const performanceCalculator = ruleset.createPerformanceCalculator(
		beatmapDifficulty,
		_score
	);

	const pp = performanceCalculator.calculate();
	_score.statistics.ignoreMiss = score.statistics.count_miss;
	const pp_fc = performanceCalculator.calculate();

	return {
		pp: pp,
		fc: pp_fc,
		starRating: beatmapDifficulty.starRating,
		maxCombo: beatmapDifficulty.maxCombo,
	};
};
