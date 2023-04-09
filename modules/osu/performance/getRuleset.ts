import { IRuleset } from "osu-classes";
import { StandardRuleset } from "osu-standard-stable";
import { TaikoRuleset } from "osu-taiko-stable";
import { CatchRuleset } from "osu-catch-stable";
import { ManiaRuleset } from "osu-mania-stable";
import { GameMode, GameModeName } from "../../../types/game_mode";

export function getRulesetById(rulesetId: number): IRuleset {
  switch (rulesetId) {
    case GameMode.taiko: return new TaikoRuleset();
    case GameMode.fruits: return new CatchRuleset();
    case GameMode.mania: return new ManiaRuleset();
  }

  return new StandardRuleset();
}

export function getRulesetByName(name: GameModeName): IRuleset {
  switch (name.toLowerCase()) {
    case "taiko": return new TaikoRuleset();
    case "fruits":
    case "catch": return new CatchRuleset();
    case "mania": return new ManiaRuleset();
  }
  
  return new StandardRuleset();
}