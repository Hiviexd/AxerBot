import { CatchRuleset } from "osu-catch-stable";
import { ManiaRuleset } from "osu-mania-stable";
import { BeatmapDecoder } from "osu-parsers";
import { StandardRuleset } from "osu-standard-stable";
import { TaikoRuleset } from "osu-taiko-stable";
import { Beatmap } from "../../../types/beatmap";
import { GameModeName } from "../../../types/game_mode";
import timeString from "../timeString";

export default (
	beatmap: Beatmap,
	mode: GameModeName,
	beatmap_file: string,
	mods?: string
) => {
	mods ? mods : (mods = "NM");
	let description = "";

	switch (mode) {
		case "osu": {
			const decoder = new BeatmapDecoder();
			const parsed: any = decoder.decodeFromString(beatmap_file);
			const ruleset = new StandardRuleset();
			const difficultyCalculator =
				ruleset.createDifficultyCalculator(parsed);
			const attributes = difficultyCalculator.calculateWithMods(
				ruleset.createModCombination(mods)
			);

			description = `SR: \`${beatmap.difficulty_rating.toFixed(
				2
			)}\` Combo: \`${attributes.maxCombo}\` Length: \`${timeString(
				beatmap.total_length
			)}\` BPM: \`${
				parsed.bpmMin == parsed.bpmMax
					? parsed.bpmMin.toFixed(0)
					: `(Min: ${parsed.bpmMin.toFixed(0)} / Max: ${Number(
							parsed.bpmMax
					  ).toFixed(0)})`
			}\`
            OD: \`${attributes.overallDifficulty.toFixed(
				1
			)}\` HP: \`${attributes.drainRate.toFixed(
				1
			)}\` AR: \`${attributes.approachRate.toFixed(1)}\` CS: \`${
				beatmap.cs
			}\` Aim Strain: \`${attributes.aimStrain.toFixed(
				2
			)}\` Speed Strain: \`${attributes.speedStrain.toFixed(2)}\``;

			break;
		}

		case "taiko": {
			const decoder = new BeatmapDecoder();
			const parsed: any = decoder.decodeFromString(beatmap_file);
			const ruleset = new TaikoRuleset();
			const difficultyCalculator =
				ruleset.createDifficultyCalculator(parsed);
			const attributes = difficultyCalculator.calculateWithMods(
				ruleset.createModCombination(mods)
			);
			description = `SR: \`${beatmap.difficulty_rating.toFixed(
				2
			)}\` Combo: \`${attributes.maxCombo}\` Length: \`${timeString(
				beatmap.total_length
			)}\` BPM: \`${
				parsed.bpmMin == parsed.bpmMax
					? parsed.bpmMin.toFixed(0)
					: `(Min: ${parsed.bpmMin.toFixed(0)} / Max: ${Number(
							parsed.bpmMax
					  ).toFixed(0)})`
			}\`
            OD: \`${beatmap.accuracy}\` HP: \`${
				beatmap.drain
			}\` Stamina Strain: \`${attributes.staminaStrain.toFixed(2)}\` 
            Colour Strain: \`${attributes.colourStrain.toFixed(
				2
			)}\` Rhythm Strain: \`${attributes.rhythmStrain.toFixed(2)}\``;

			break;
		}

		case "fruits": {
			const decoder = new BeatmapDecoder();
			const parsed: any = decoder.decodeFromString(beatmap_file);
			const ruleset = new CatchRuleset();
			const difficultyCalculator =
				ruleset.createDifficultyCalculator(parsed);
			const attributes = difficultyCalculator.calculateWithMods(
				ruleset.createModCombination(mods)
			);

			description = `SR: \`${beatmap.difficulty_rating.toFixed(
				2
			)}\` Combo: \`${attributes.maxCombo}\` Length: \`${timeString(
				beatmap.total_length
			)}\` BPM: \`${
				parsed.bpmMin == parsed.bpmMax
					? parsed.bpmMin.toFixed(0)
					: `(Min: ${parsed.bpmMin.toFixed(0)} / Max: ${Number(
							parsed.bpmMax
					  ).toFixed(0)})`
			}\`
            OD: \`${beatmap.accuracy}\` HP: \`${
				beatmap.drain
			}\` AR: \`${attributes.approachRate.toFixed(1)}\` CS: \`${
				beatmap.cs
			}\``;

			break;
		}

		case "mania": {
			const decoder = new BeatmapDecoder();
			const parsed: any = decoder.decodeFromString(beatmap_file);
			const ruleset = new ManiaRuleset();
			const difficultyCalculator =
				ruleset.createDifficultyCalculator(parsed);
			const attributes = difficultyCalculator.calculateWithMods(
				ruleset.createModCombination(mods)
			);

			description = `SR: \`${beatmap.difficulty_rating.toFixed(
				2
			)}\` Combo: \`${attributes.maxCombo}\` Length: \`${timeString(
				beatmap.total_length
			)}\` BPM: \`${
				parsed.bpmMin == parsed.bpmMax
					? parsed.bpmMin.toFixed(0)
					: `(Min: ${parsed.bpmMin.toFixed(0)} / Max: ${Number(
							parsed.bpmMax
					  ).toFixed(0)})`
			}\`
            OD: \`${beatmap.accuracy}\` HP: \`${beatmap.drain}\``;

			break;
		}
	}

	return description;
};
