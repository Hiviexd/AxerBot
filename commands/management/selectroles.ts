import { SlashCommand } from "../../models/commands/SlashCommand";
import newSelectRole from "./subcommands/selectroles/newSelectRole";

const selectroles = new SlashCommand(
    "selectroles",
    "Reaction roles but more cool",
    "Management",
    false
);

selectroles.addSubcommand(newSelectRole);

export default selectroles;
