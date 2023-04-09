import { RulesetBeatmap, HitType } from 'osu-classes';
import { JuiceDroplet, JuiceFruit, JuiceTinyDroplet } from 'osu-catch-stable';
import { GameMode } from '../../../types/game_mode';

export function getTotalHits(beatmap: RulesetBeatmap): number {
  if (!beatmap) return 0;

  switch (beatmap.mode) {
    case GameMode.osu: {
      const circles = countHittable(beatmap);
      const sliders = countSlidable(beatmap);
      const spinners = countSpinnable(beatmap);

      return circles + sliders + spinners;
    }

    case GameMode.taiko: {
      return countHittable(beatmap);
    }

    case GameMode.fruits: {
      const hittable = countHittable(beatmap);
      const tinyDroplets = countTinyDroplets(beatmap);
      const droplets = countDroplets(beatmap) - tinyDroplets;
      const fruits = countFruits(beatmap) + hittable;

      return fruits + droplets + tinyDroplets;
    }

    case GameMode.mania: {
      const notes = countHittable(beatmap);
      const holds = countHoldable(beatmap);

      return notes + holds;
    }
  }

  const hittable = countHittable(beatmap);
  const slidable = countSlidable(beatmap);
  const spinnable = countSpinnable(beatmap);
  const holdable = countHoldable(beatmap);

  return hittable + slidable + spinnable + holdable;
}

export function countHittable(beatmap: RulesetBeatmap): number {
  return countObjects(HitType.Normal, beatmap);
}

export function countSlidable(beatmap: RulesetBeatmap): number {
  return countObjects(HitType.Slider, beatmap);
}

export function countSpinnable(beatmap: RulesetBeatmap): number {
  return countObjects(HitType.Spinner, beatmap);
}

export function countHoldable(beatmap: RulesetBeatmap): number {
  return countObjects(HitType.Hold, beatmap);
}

function countObjects(hitType: HitType, beatmap: RulesetBeatmap): number {
  if (!beatmap) return 0;

  return beatmap.hitObjects.reduce((sum, obj) => {
    return sum + (obj.hitType & hitType ? 1 : 0);
  }, 0);
}

export function countFruits(beatmap: RulesetBeatmap): number {
  return countNested(JuiceFruit, beatmap);
}

export function countDroplets(beatmap: RulesetBeatmap): number {
  return countNested(JuiceDroplet, beatmap);
}

export function countTinyDroplets(beatmap: RulesetBeatmap): number {
  return countNested(JuiceTinyDroplet, beatmap);
}

function countNested(Class: new () => any, beatmap: RulesetBeatmap): number {
  return beatmap.hitObjects.reduce((sum, obj) => {
    const nestedSum = obj.nestedHitObjects?.reduce((sum, obj) => {
      return sum + (obj instanceof Class ? 1 : 0);
    }, 0);

    return sum + (nestedSum ?? 0);
  }, 0);
}