import { SlashCommand } from "../../models/commands/SlashCommand";
import { SlashCommandSubcommandGroup } from "../../models/commands/SlashCommandSubcommandGroup";
import verificationAddGroupRole from "./subcommands/verification/addGroupRole";
import verificationAddRankRole from "./subcommands/verification/addRankRole";
import verificationAddRole from "./subcommands/verification/addRole";
import verificationSetDisabled from "./subcommands/verification/disable";
import verificationSetEnabled from "./subcommands/verification/enable";
import verificationRemoveGroupRole from "./subcommands/verification/removeGroupRole";
import verificationRemoveRankRole from "./subcommands/verification/removeRankRole";
import verificationRemoveRole from "./subcommands/verification/removeRole";
import verificationSetButton from "./subcommands/verification/setButton";
import verificationSetChannel from "./subcommands/verification/setChannel";
import verificationSetFlags from "./subcommands/verification/setFlags";
import verificationSetMessage from "./subcommands/verification/setMessage";
import verificationStatus from "./subcommands/verification/status";

const verification = new SlashCommand(
    "verification",
    "Verify new server members automatically using their osu! data!",
    "management",
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

verification.addSubcommand(verificationStatus);
verification.addSubcommand(verificationSetDisabled);
verification.addSubcommand(verificationSetEnabled);

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
    .addCommand(verificationAddRole);

const commandGroupREMOVE = new SlashCommandSubcommandGroup(
    "remove",
    "Remove a value to a module option."
);

commandGroupREMOVE
    .addCommand(verificationRemoveRankRole)
    .addCommand(verificationRemoveRole)
    .addCommand(verificationRemoveGroupRole);

verification
    .addSubcommandGroup(commandGroupADD)
    .addSubcommandGroup(commandGroupREMOVE)
    .addSubcommandGroup(commandGroupSET);

export default verification;
