import { SlashCommand } from "../../models/commands/SlashCommand";
import createRoleSelector from "./subcommands/selectroles/createRoleSelector";
import editRoleSelector from "./subcommands/selectroles/editRoleSelector";

const selectroles = new SlashCommand(
    "selectroles",
    "Manage role dropdown menus",
    "Management",
    false
);

selectroles.addSubcommand(createRoleSelector).addSubcommand(editRoleSelector);

export default selectroles;
