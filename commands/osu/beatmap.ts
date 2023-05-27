import { SlashCommand } from "../../models/commands/SlashCommand";
import calculateBeatmap from "./subcommands/beatmap/calculateBeatmap";
import randomBeatmap from "./subcommands/beatmap/randomBeatmap";
import searchBeatmap from "./subcommands/beatmap/searchBeatmap";

const beatmap = new SlashCommand(
    "beatmap",
    "Collection of beatmap commands",
    "osu!",
    true
);

beatmap.addSubcommand(searchBeatmap);
beatmap.addSubcommand(calculateBeatmap);
// beatmap.addSubcommand(randomBeatmap);

export default beatmap;
