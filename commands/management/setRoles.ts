import { SlashCommand } from "../../models/commands/SlashCommand";
import { SlashCommandSubcommandGroup } from "../../models/commands/SlashCommandSubcommandGroup";
import setRolesApply from "./subcommands/setRoles/setRolesApply";
import setRolesAddPreset from "./subcommands/setRoles/setRolesAddPreset";
import setRolesRemovePreset from "./subcommands/setRoles/setRolesRemovePreset";
import setRolesListPresets from "./subcommands/setRoles/setRolesListPresets";

const setRolesCommand = new SlashCommand(
    "setroles",
    "Set roles to a user or more",
    "Management",
    false,
    {
        modules: `\`presets\`: manage role presets
        \`apply\`: applies a role preset to a user or more
        \`remove\`: removes a role preset from a user or more`,
    },
    []
);

setRolesCommand.addSubcommand(setRolesApply);

const commandGroupPRESETS = new SlashCommandSubcommandGroup(
    "presets",
    "Manage role presets"
);

commandGroupPRESETS
    .addCommand(setRolesAddPreset)
    .addCommand(setRolesRemovePreset)
    .addCommand(setRolesListPresets);

setRolesCommand.addSubcommandGroup(commandGroupPRESETS);

export default setRolesCommand;
