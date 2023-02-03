import { getReplayPerformanceByURL } from "../../helpers/osu/performance/createReplayInfo";

export async function SendScoreEmbed(url: string) {
	const replayPerformance = await getReplayPerformanceByURL(url, false);

	console.log(replayPerformance);
}
