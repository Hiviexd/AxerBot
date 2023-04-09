import { IScoreInfo } from "osu-classes";
import { GameMode } from "../../../types/game_mode";

export function calculateAccuracy(scoreInfo: IScoreInfo): number {
  const geki = scoreInfo.countGeki;
  const katu = scoreInfo.countKatu;
  const c300 = scoreInfo.count300;
  const c100 = scoreInfo.count100;
  const c50 = scoreInfo.count50;
  const total = scoreInfo.totalHits;

  if (total <= 0) return 1;

  switch (scoreInfo.rulesetId) {
    case GameMode.osu:
      return Math.max(0, (c50 / 6 + c100 / 3 + c300) / total);

    case GameMode.taiko:
      return Math.max(0, (c100 / 2 + c300) / total);

    case GameMode.fruits:
      return Math.max(0, (c50 + c100 + c300) / total);

    case GameMode.mania:
      return Math.max(0, (c50 / 6 + c100 / 3 + katu / 1.5 + (c300 + geki)) / total);
  }

  return 1;
}