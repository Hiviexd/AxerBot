import { SlashCommand } from "../../models/commands/SlashCommand";
import { SlashCommandSubcommandGroup } from "../../models/commands/SlashCommandSubcommandGroup";
import verificationAddGroupRole from "./subcommands/verification/addGroupRole";
import verificationAddMapperRole from "./subcommands/verification/addMapperRole";
import verificationAddRankRole from "./subcommands/verification/addRankRole";
import verificationAddRole from "./subcommands/verification/addRole";
import verificationSetDisabled from "./subcommands/verification/disable";
import verificationSetEnabled from "./subcommands/verification/enable";
import verificationNewSyncEmbed from "./subcommands/verification/newSyncEmbed";
import verificationRemoveGroupRole from "./subcommands/verification/removeGroupRole";
import verificationRemoveMapperRole from "./subcommands/verification/removeMapperRole";
import verificationRemoveRankRole from "./subcommands/verification/removeRankRole";
import verificationRemoveRole from "./subcommands/verification/removeRole";
import verificationSetButton from "./subcommands/verification/setButton";
import verificationSetChannel from "./subcommands/verification/setChannel";
import verificationSetFlags from "./subcommands/verification/setFlags";
import verificationSetMessage from "./subcommands/verification/setMessage";
import verificationStatus from "./subcommands/verification/status";
import verificationSync from "./subcommands/verification/sync";

const verificationCommand = new SlashCommand(
    "verification",
    "Verify new server members automatically using their osu! data!",
    "Management",
    false,
    {
        modules: `\`channel\`: Set the system channel
        \`flags\`: Set flags to the system (Example: sync nickname)
		\`roles\`: Set the roles that will be given to all verified users
		\`grouproles\`: Set the roles that will be given to all verified users with X osu! usergroup (i.e BNs)
        \`message\`: Set the welcome message to send on the channel
		\`channel\`: Set the welcome message to send on the channel
        \`enable\`: Enable the system manually.
        \`disable\`: Yep`,
    },
    []
);

verificationCommand.addSubcommand(verificationStatus);
verificationCommand.addSubcommand(verificationSetDisabled);
verificationCommand.addSubcommand(verificationSetEnabled);
verificationCommand.addSubcommand(verificationSync);

const commandGroupSET = new SlashCommandSubcommandGroup(
    "set",
    "Set a value to a module option."
);

commandGroupSET
    .addCommand(verificationSetButton)
    .addCommand(verificationSetChannel)
    .addCommand(verificationSetFlags)
    .addCommand(verificationSetMessage);

const commandGroupADD = new SlashCommandSubcommandGroup(
    "add",
    "Add a value to a module option."
);

commandGroupADD
    .addCommand(verificationAddGroupRole)
    .addCommand(verificationAddRankRole)
    .addCommand(verificationAddRole)
    .addCommand(verificationAddMapperRole);

const commandGroupREMOVE = new SlashCommandSubcommandGroup(
    "remove",
    "Remove a value to a module option."
);

const commandGroupNEW = new SlashCommandSubcommandGroup(
    "new",
    "Create a new module value"
);

commandGroupNEW.addCommand(verificationNewSyncEmbed);

commandGroupREMOVE
    .addCommand(verificationRemoveRankRole)
    .addCommand(verificationRemoveRole)
    .addCommand(verificationRemoveGroupRole)
    .addCommand(verificationRemoveMapperRole);

verificationCommand
    .addSubcommandGroup(commandGroupADD)
    .addSubcommandGroup(commandGroupREMOVE)
    .addSubcommandGroup(commandGroupSET)
    .addSubcommandGroup(commandGroupNEW);

export default verificationCommand;
