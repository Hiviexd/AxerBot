import { RulesetBeatmap, IHitStatistics, MathUtils } from 'osu-classes';
import { GameMode } from '../../../types/game_mode';
import { 
  countDroplets, 
  countFruits, 
  countTinyDroplets, 
  getTotalHits 
} from './calculateHits';

interface IHitStatisticsInput {
  beatmap: RulesetBeatmap;
  accuracy?: number;
  countMiss?: number;
  count50?: number;
  count100?: number;
  count300?: number;
  countKatu?: number;
}

export function generateHitStatistics(options: IHitStatisticsInput) {
  switch (options.beatmap.mode) {
    case GameMode.taiko:
      return generateTaikoHitStatistics(options);

    case GameMode.fruits:
      return generateCatchHitStatistics(options);

    case GameMode.mania:
      return generateManiaHitStatistics(options);
  }

  return generateOsuHitStatistics(options);
}

function generateOsuHitStatistics(options: IHitStatisticsInput): IHitStatistics {
  const beatmap = options.beatmap;
  const accuracy = getAccuracy(options);
  const totalHits = getTotalHits(beatmap);

  let count50 = options.count50;
  let count100 = options.count100;
  let countMiss = options.countMiss ?? 0;

  countMiss = MathUtils.clamp(countMiss, 0, totalHits);
  count50 = count50 ? MathUtils.clamp(count50, 0, totalHits - countMiss) : 0;

  if (typeof count100 !== 'number') {
    count100 = Math.round((totalHits - totalHits * accuracy) * 1.5);
  }
  else {
    count100 = MathUtils.clamp(count100, 0, totalHits - count50 - countMiss);
  }

  const count300 = totalHits - count100 - count50 - countMiss;

  return getValidHitStatistics({
    great: count300,
    ok: count100,
    meh: count50,
    miss: countMiss,
  });
}

function generateTaikoHitStatistics(options: IHitStatisticsInput): IHitStatistics {
  const beatmap = options.beatmap;
  const accuracy = getAccuracy(options);
  const totalHits = getTotalHits(beatmap);

  let count100 = options.count100;
  let countMiss = options.countMiss ?? 0;

  countMiss = MathUtils.clamp(countMiss, 0, totalHits);

  let count300;

  if (typeof count100 !== 'number') {
    const targetTotal = Math.round(accuracy * totalHits * 2);

    count300 = targetTotal - (totalHits - countMiss);
    count100 = totalHits - count300 - countMiss;
  }
  else {
    count100 = MathUtils.clamp(count100, 0, totalHits - countMiss);
    count300 = totalHits - count100 - countMiss;
  }

  return getValidHitStatistics({
    great: count300,
    ok: count100,
    miss: countMiss,
  });
}

function generateCatchHitStatistics(options: IHitStatisticsInput): IHitStatistics {
  const beatmap = options.beatmap;
  const accuracy = getAccuracy(options);
  const count50 = options.count50;
  const count100 = options.count100;

  let countMiss = options.countMiss ?? 0;

  const maxCombo = beatmap.maxCombo ?? 0;
  const maxFruits = countFruits(beatmap);
  const maxDroplets = countDroplets(beatmap);
  const maxTinyDroplets = countTinyDroplets(beatmap);

  if (typeof count100 === 'number') {
    countMiss += maxDroplets - count100;
  }

  countMiss = MathUtils.clamp(countMiss, 0, maxDroplets + maxFruits);

  let droplets = count100 ?? Math.max(0, maxDroplets - countMiss);

  droplets = MathUtils.clamp(droplets, 0, maxDroplets);

  const fruits = maxFruits - (countMiss - (maxDroplets - droplets));

  let tinyDroplets = Math.round(accuracy * (maxCombo + maxTinyDroplets));

  tinyDroplets = count50 ?? tinyDroplets - fruits - droplets;

  const tinyMisses = maxTinyDroplets - tinyDroplets;

  return getValidHitStatistics({
    great: MathUtils.clamp(fruits, 0, maxFruits),
    largeTickHit: MathUtils.clamp(droplets, 0, maxDroplets),
    smallTickHit: tinyDroplets,
    smallTickMiss: tinyMisses,
    miss: countMiss,
  });
}

function generateManiaHitStatistics(options: IHitStatisticsInput): IHitStatistics {
  // Accuracy = (n50 / 6 + n100 / 3 + katu / 1.5 + (n300 + geki)) / total

  const beatmap = options.beatmap;
  const accuracy = getAccuracy(options);
  const totalHits = getTotalHits(beatmap);

  let count300 = options.count300 ?? 0;
  let countKatu = options.countKatu ?? 0; // Goods (200)
  let count100 = options.count100 ?? 0;
  let count50 = options.count50;
  let countMiss = options.countMiss ?? 0;

  countMiss = MathUtils.clamp(countMiss, 0, totalHits);

  let currentCounts = countMiss;

  if (typeof count50 === 'number' || typeof options.accuracy !== 'number') {
    count50 = count50 ? MathUtils.clamp(count50, 0, totalHits - currentCounts) : 0;
  }
  else {
    /**
     * Acc = 0.98, Total = 1000
     * 
     * n50 / 6 + n100 / 3 + katu / 1.5 + n300 + geki = Acc * Total = 980
     * n50 + n100 + katu + n300 + geki = 1000
     * 
     * 5 * n50 / 6 + 2 * n100 / 3 + katu / 3 = 20
     * 
     * n50 = 1.2 * (20 - 2 * n100 / 3 - katu / 3)
     * 
     * n50 = 24 - 0.8 * n100 - 0.4 * katu
     */
    count50 = (totalHits - totalHits * accuracy) * 1.2;

    count50 = Math.round(count50 - 0.8 * count100 - 0.4 * countKatu);
  }

  currentCounts += count50;

  count100 = MathUtils.clamp(count100, 0, totalHits - currentCounts);

  currentCounts += count100;

  countKatu = MathUtils.clamp(countKatu, 0, totalHits - currentCounts);

  currentCounts += countKatu;

  count300 = MathUtils.clamp(count300, 0, totalHits - currentCounts);

  currentCounts += count300;

  const countGeki = totalHits - count300 - countKatu - count100 - count50 - countMiss;

  return getValidHitStatistics({
    perfect: countGeki,
    great: count300,
    good: countKatu,
    ok: count100,
    meh: count50,
    miss: countMiss,
  });
}

function getAccuracy(options: IHitStatisticsInput): number {
  if (typeof options.accuracy !== 'number') return 1;

  if (options.accuracy > 1) return options.accuracy / 100;

  return options.accuracy;
}

function getValidHitStatistics(original?: Partial<IHitStatistics>) {
  return {
    perfect: original?.perfect ?? 0,
    great: original?.great ?? 0,
    good: original?.good ?? 0,
    ok: original?.ok ?? 0,
    meh: original?.meh ?? 0,
    largeTickHit: original?.largeTickHit ?? 0,
    smallTickMiss: original?.smallTickMiss ?? 0,
    smallTickHit: original?.smallTickHit ?? 0,
    miss: original?.miss ?? 0,
    largeBonus: 0,
    largeTickMiss: 0,
    smallBonus: 0,
    ignoreHit: 0,
    ignoreMiss: 0,
    none: 0,
  };
}
