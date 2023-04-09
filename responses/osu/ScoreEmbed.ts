import { getReplayPerformanceByURL } from "../../modules/osu/performance/createReplayInfo";

export async function SendScoreEmbed(url: string) {
    const replayPerformance = await getReplayPerformanceByURL(url, false);
}
