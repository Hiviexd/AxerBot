import { DifficultyAttributes, IBeatmap } from "osu-classes";
import { StandardDifficultyAttributes } from "osu-standard-stable";
import { TaikoDifficultyAttributes } from "osu-taiko-stable";
import { CatchDifficultyAttributes } from "osu-catch-stable";
import { Beatmap } from "../../../types/beatmap";
import { GameModeName } from "../../../types/game_mode";
import timeString from "../timeString";

export default (
	beatmap: Beatmap,
	mode: GameModeName,
	parsed: IBeatmap,
	attributes: DifficultyAttributes,
) => {
	const bpmMin = parsed.bpmMin.toFixed(0);
	const bpmMax = parsed.bpmMax.toFixed(0);
	const bpmMode = parsed.bpmMode.toFixed(0);
	const bpm = bpmMin === bpmMax 
		? bpmMode 
		: `(Min: ${bpmMin} / Max: ${bpmMax})`;

	const description = [
		`SR: \`${beatmap.difficulty_rating.toFixed(2)}\``,
		`Combo: \`${attributes.maxCombo}\``,
		`Length: \`${timeString(beatmap.total_length)}\``,
		`BPM: \`${bpm}\``,
	];

	switch (mode) {
		case "osu": {
			const difficulty = attributes as StandardDifficultyAttributes;

			description.push(
				`OD: \`${difficulty.overallDifficulty.toFixed(1)}\``
			);

			description.push(
				`HP: \`${difficulty.drainRate.toFixed(1)}\``)
			; 

			description.push(
				`AR: \`${difficulty.approachRate.toFixed(1)}\``)
			; 

			description.push(
				`CS: \`${parsed.difficulty.circleSize.toFixed(1)}\``
			);

			description.push(
				`Aim Strain: \`${difficulty.aimDifficulty.toFixed(2)}\``
			);

			description.push(
				`Speed Strain: \`${difficulty.speedDifficulty.toFixed(2)}\``
				);

			break;
		}

		case "taiko": {
			const difficulty = attributes as TaikoDifficultyAttributes;

			description.push(
				`OD: \`${parsed.difficulty.overallDifficulty.toFixed(1)}\``
			);

			description.push(
				`HP: \`${parsed.difficulty.drainRate.toFixed(1)}\``
			); 

			description.push(
				`Stamina Strain: \`${difficulty.staminaDifficulty.toFixed(2)}\``
			);

			description.push(
				`Colour Strain: \`${difficulty.colourDifficulty.toFixed(2)}\``
			);

			description.push(
				`Rhythm Strain: \`${difficulty.rhythmDifficulty.toFixed(2)}\``
			);

			description.push(
				`Peaks Strain: \`${difficulty.peakDifficulty.toFixed(2)}\``
			);

			break;
		}

		case "fruits": {
			const difficulty = attributes as CatchDifficultyAttributes;

			description.push(
				`OD: \`${parsed.difficulty.overallDifficulty.toFixed(1)}\``
			);

			description.push(
				`HP: \`${parsed.difficulty.drainRate.toFixed(1)}\``
			); 

			description.push(
				`AR: \`${difficulty.approachRate.toFixed(1)}\``
			); 

			description.push(
				`CS: \`${parsed.difficulty.circleSize.toFixed(1)}\``
			);

			break;
		}

		case "mania": {
			description.push(
				`OD: \`${parsed.difficulty.overallDifficulty.toFixed(1)}\``
			);

			description.push(
				`HP: \`${parsed.difficulty.drainRate.toFixed(1)}\``
			);

			break;
		}
	}

	return description.join(' ');
};
