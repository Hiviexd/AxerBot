import { BeatmapInfo, RulesetBeatmap } from "osu-classes";

import { 
  countHittable, 
  countHoldable, 
  countSlidable, 
  countSpinnable 
} from "./calculateHits";

export function createBeatmapInfo(beatmap: RulesetBeatmap): BeatmapInfo {
  return new BeatmapInfo({
    id: beatmap?.metadata.beatmapId,
    beatmapsetId: beatmap?.metadata.beatmapSetId,
    creator: beatmap?.metadata.creator,
    title: beatmap?.metadata.title,
    artist: beatmap?.metadata.artist,
    version: beatmap?.metadata.version,
    hittable: countHittable(beatmap),
    slidable: countSlidable(beatmap),
    spinnable: countSpinnable(beatmap),
    holdable: countHoldable(beatmap),
    length: (beatmap?.length ?? 0) / 1000,
    bpmMin: beatmap?.bpmMin,
    bpmMax: beatmap?.bpmMax,
    bpmMode: beatmap?.bpmMode,
    circleSize: beatmap?.difficulty.circleSize,
    approachRate: beatmap?.difficulty.approachRate,
    overallDifficulty: beatmap?.difficulty.overallDifficulty,
    drainRate: beatmap?.difficulty.drainRate,
    rulesetId: beatmap?.mode,
    mods: beatmap?.mods,
    maxCombo: beatmap?.maxCombo,
    isConvert: beatmap?.originalMode !== beatmap?.mode,
  });
}