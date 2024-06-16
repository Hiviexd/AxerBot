import { SlashCommand } from "../../models/commands/SlashCommand";
import { SlashCommandSubcommandGroup } from "../../models/commands/SlashCommandSubcommandGroup";
import { calculateBeatmap } from "./subcommands/beatmap/calculateBeatmap";
import { searchBeatmap } from "./subcommands/beatmap/searchBeatmap";
import { checkArtistPermissionsBeatmap } from "./subcommands/beatmap/checkArtistPermissionsBeatmap";
import { CommandCategory } from "../../struct/commands/CommandCategory";

const beatmap = new SlashCommand()
    .setName("beatmap")
    .setDescription("Collection of beatmap related commands")
    .setCategory(CommandCategory.Osu)
    .setDMPermission(true)
    .addSubcommand(searchBeatmap)
    .addSubcommand(calculateBeatmap);

const commandGroupCHECK = new SlashCommandSubcommandGroup()
    .setName("check")
    .setDescription("Perform some checks in the map")
    .addCommands(checkArtistPermissionsBeatmap);

beatmap.addSubcommandGroup(commandGroupCHECK);

export { beatmap };
