import { SlashCommand } from "../../models/commands/SlashCommand";
import { CommandCategory } from "../../struct/commands/CommandCategory";
import { createRoleSelector } from "./subcommands/selectroles/createRoleSelector";
import { editRoleSelector } from "./subcommands/selectroles/editRoleSelector";

const selectroles = new SlashCommand()
    .setName("selectroles")
    .setDescription("Manage role dropdown menus")
    .setCategory(CommandCategory.Management)
    .addSubcommands(createRoleSelector, editRoleSelector);

export { selectroles };
