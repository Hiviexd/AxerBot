import { SlashCommand } from "../../models/commands/SlashCommand";
import { SlashCommandSubcommandGroup } from "../../models/commands/SlashCommandSubcommandGroup";
import calculateBeatmap from "./subcommands/beatmap/calculateBeatmap";
// import randomBeatmap from "./subcommands/beatmap/randomBeatmap";
import searchBeatmap from "./subcommands/beatmap/searchBeatmap";
import checkArtistPermissionsBeatmap from "./subcommands/beatmap/checkArtistPermissionsBeatmap";


const beatmap = new SlashCommand(
    "beatmap",
    "Collection of beatmap commands",
    "osu!",
    true
);

beatmap.addSubcommand(searchBeatmap);
beatmap.addSubcommand(calculateBeatmap);
// beatmap.addSubcommand(randomBeatmap);

const commandGroupCHECK = new SlashCommandSubcommandGroup("check", "Perform a check on a beatmap");

commandGroupCHECK.addCommand(checkArtistPermissionsBeatmap);

beatmap.addSubcommandGroup(commandGroupCHECK);

export default beatmap;
