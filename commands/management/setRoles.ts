import { SlashCommand } from "../../models/commands/SlashCommand";
import { SlashCommandSubcommandGroup } from "../../models/commands/SlashCommandSubcommandGroup";
import { setRolesApply } from "./subcommands/setRoles/setRolesApply";
import { setRolesAddPreset } from "./subcommands/setRoles/setRolesAddPreset";
import { setRolesRemovePreset } from "./subcommands/setRoles/setRolesRemovePreset";
import { setRolesListPresets } from "./subcommands/setRoles/setRolesListPresets";
import { CommandCategory } from "../../struct/commands/CommandCategory";
const setRolesCommand = new SlashCommand()
    .setName("setroles")
    .setDescription("Set roles to an user or more")
    .setCategory(CommandCategory.Management)
    .setHelp({
        modules: `\`presets\`: manage role presets
            \`apply\`: applies a role preset to a user or more
            \`remove\`: removes a role preset from a user or more`,
    })
    .addSubcommand(setRolesApply)
    .addSubcommandGroups(
        new SlashCommandSubcommandGroup()
            .setName("presets")
            .setDescription("Manage role presets")
            .addCommands(setRolesAddPreset, setRolesRemovePreset, setRolesListPresets)
    );

export default setRolesCommand;
