import { ScoreCalculator } from "@kionell/osu-pp-calculator";

// ========= The problem:
// Replay decoder isn't returning replay data from the buffer
// ===========
// export async function getReplayPerformanceByFile(
// 	scoreFileURL: string,
// 	fix: boolean
// ) {
// 	const scoreDecoder = new ScoreDecoder();
// 	const scoreCalculator = new ScoreCalculator();

// 	const scoreBuffer = await osuApi.download.unofficialReplay(scoreFileURL);

// 	const scoreInfo = await scoreDecoder.decodeFromBuffer(scoreBuffer, true);

// 	if (!scoreInfo.info.beatmap || scoreInfo.info.beatmapId == 0)
// 		return new Error("Invalid beatmap!");

// 	const result = await scoreCalculator.calculate({
// 		replayURL: scoreFileURL,
// 		lifeBar: true,
// 		fix,
// 	});

// 	return result;
// }

export async function getReplayPerformanceByURL(
	scoreURL: string,
	fix: boolean
) {
	const scoreCalculator = new ScoreCalculator();

	const result = await scoreCalculator.calculate({
		replayURL: scoreURL,
		lifeBar: true,
		fix,
	});

	return result;
}
