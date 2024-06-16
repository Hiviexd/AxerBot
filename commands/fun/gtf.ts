import { SlashCommand } from "../../models/commands/SlashCommand";
import { CommandCategory } from "../../struct/commands/CommandCategory";
import { gtfLeaderboard } from "./subcommands/gtf/leaderboard";
import { gtfNewGame } from "./subcommands/gtf/newGame";

const guesstheflag = new SlashCommand()
    .setName("guesstheflag")
    .setNameAliases(["gtf"])
    .setDescription('Play a "guess the flag" game')
    .setCategory(CommandCategory.Fun)
    .setDMPermission(false)
    .addSubcommand(gtfNewGame)
    .addSubcommand(gtfLeaderboard);

export { guesstheflag };
