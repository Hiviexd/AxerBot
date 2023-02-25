import { SlashCommand } from "../../models/commands/SlashCommand";
import gtfLeaderboard from "./subcommands/gtf/leaderboard";
import gtfNewGame from "./subcommands/gtf/newGame";

const guesstheflag = new SlashCommand(
    ["guesstheflag", "gtf"],
    'A fun "Guess the Flag" minigame!',
    "Fun",
    true
);

guesstheflag.addSubcommand(gtfNewGame).addSubcommand(gtfLeaderboard);

export default guesstheflag;
