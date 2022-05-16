import { BeatmapDecoder } from "osu-parsers";
import { ManiaRuleset } from "osu-mania-stable";
import { Score } from "../../../types/score";
// import { ScoreInfo, BeatmapInfo } from "osu-classes";
// import calculateHits from "./calculateHits";
// import calculateManiaScore from "./calculateManiaScore";

export default (osu_file: string, _score: Score) => {
	// Mod to binary

	const parsed: any = new BeatmapDecoder().decodeFromString(osu_file);

	const ruleset = new ManiaRuleset();

	const difficultyAttributes = ruleset.createDifficultyCalculator(parsed);

	const _mods = ruleset.createModCombination(_score.mods_int);
	const mods = _mods.acronyms;

	const difficulty = difficultyAttributes.calculateWithMods(_mods);

	let score = _score.score;
	score *= Math.pow(
		0.5,
		Number(mods.includes("EZ")) +
			Number(mods.includes("NF")) +
			Number(mods.includes("HT"))
	);
	let nerfpp =
		(mods.includes("EZ") ? 0.5 : 1) * (mods.includes("NF") ? 0.9 : 1);
	//
	// Nerf od and pp
	var sb =
		(Math.pow(5 * Math.max(1, difficulty.starRating / 0.2) - 4, 2.2) /
			135) *
		(1 + 0.1 * Math.min(1, parsed.hitObjects.length / 1500)); //StrainBase
	var sm =
		score < 500000
			? (score / 500000) * 0.1
			: score < 600000
			? ((score - 500000) / 100000) * 0.3
			: score < 700000
			? ((score - 600000) / 100000) * 0.25 + 0.3
			: score < 800000
			? ((score - 700000) / 100000) * 0.2 + 0.55
			: score < 900000
			? ((score - 800000) / 100000) * 0.15 + 0.75
			: ((score - 900000) / 100000) * 0.1 + 0.9; //StrainMultiplier
	var av =
		score >= 960000
			? parsed.difficulty.overallDifficulty *
			  0.02 *
			  sb *
			  Math.pow((score - 960000) / 40000, 1.1)
			: 0; //AccValue

	return {
		pp: Math.round(
			0.73 *
				Math.pow(Math.pow(av, 1.1) + Math.pow(sb * sm, 1.1), 1 / 1.1) *
				1.1 *
				nerfpp
		),
		fc: Math.round(
			0.73 *
				Math.pow(Math.pow(av, 1.1) + Math.pow(sb * sm, 1.1), 1 / 1.1) *
				1.1 *
				nerfpp
		),
		starRating: difficulty.starRating,
		maxCombo: difficulty.maxCombo,
	};
};
