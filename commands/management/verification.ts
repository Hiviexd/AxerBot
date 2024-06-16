import { SlashCommand } from "../../models/commands/SlashCommand";
import { SlashCommandSubcommandGroup } from "../../models/commands/SlashCommandSubcommandGroup";
import { CommandCategory } from "../../struct/commands/CommandCategory";
import { verificationAddGroupRole } from "./subcommands/verification/addGroupRole";
import { verificationAddMapperRole } from "./subcommands/verification/addMapperRole";
import { verificationAddRankRole } from "./subcommands/verification/addRankRole";
import { verificationAddRole } from "./subcommands/verification/addRole";
import { verificationBanList } from "./subcommands/verification/banList";
import { verificationBanUser } from "./subcommands/verification/banUser";
import { verificationSetDisabled } from "./subcommands/verification/disable";
import { verificationSetEnabled } from "./subcommands/verification/enable";
import { verificationNewSyncEmbed } from "./subcommands/verification/newSyncEmbed";
import { verificationNewVerifyEmbed } from "./subcommands/verification/newVerifyEmbed";
import { verificationRemoveGroupRole } from "./subcommands/verification/removeGroupRole";
import { verificationRemoveMapperRole } from "./subcommands/verification/removeMapperRole";
import { verificationRemoveRankRole } from "./subcommands/verification/removeRankRole";
import { verificationRemoveRole } from "./subcommands/verification/removeRole";
import { verificationSetButton } from "./subcommands/verification/setButton";
import { verificationSetChannel } from "./subcommands/verification/setChannel";
import { verificationSetFlags } from "./subcommands/verification/setFlags";
import { verificationSetMessage } from "./subcommands/verification/setMessage";
import { verificationSetType } from "./subcommands/verification/setType";
import { verificationStatus } from "./subcommands/verification/status";
import { verificationSync } from "./subcommands/verification/sync";
import { verificationUnbanUser } from "./subcommands/verification/unbanUser";

const verificationCommand = new SlashCommand()
    .setName("verification")
    .setDescription("Verify new server members automatically using their osu! data!")
    .setPermissions("ModerateMembers")
    .setCategory(CommandCategory.Management)
    .setHelp({
        modules: `\`channel\`: Set the system channel
        \`flags\`: Set flags to the system (Example: sync nickname)
		\`roles\`: Set the roles that will be given to all verified users
		\`grouproles\`: Set the roles that will be given to all verified users with X osu! usergroup (i.e BNs)
        \`message\`: Set the welcome message to send on the channel
		\`channel\`: Set the welcome message to send on the channel
        \`enable\`: Enable the system manually.
        \`disable\`: Yep`,
    })
    .addSubcommands(
        verificationStatus,
        verificationSetDisabled,
        verificationSetEnabled,
        verificationSync
    )
    .addSubcommandGroups(
        new SlashCommandSubcommandGroup()
            .setName("set")
            .setDescription("Set a value to a module option.")
            .addCommands(
                verificationSetButton,
                verificationSetChannel,
                verificationSetFlags,
                verificationSetMessage,
                verificationSetType
            ),
        new SlashCommandSubcommandGroup()
            .setName("add")
            .setDescription("Add a value to a module option.")
            .addCommands(
                verificationAddGroupRole,
                verificationAddRankRole,
                verificationAddRole,
                verificationAddMapperRole
            ),
        new SlashCommandSubcommandGroup()
            .setName("remove")
            .setDescription("Remove a value to a module option.")
            .addCommands(
                verificationRemoveRankRole,
                verificationRemoveRole,
                verificationRemoveGroupRole,
                verificationRemoveMapperRole
            ),
        new SlashCommandSubcommandGroup()
            .setName("new")
            .setDescription("Create a new module value")
            .addCommands(verificationNewSyncEmbed, verificationNewVerifyEmbed),
        new SlashCommandSubcommandGroup()
            .setName("ban")
            .setDescription("Restrict users")
            .addCommands(verificationBanUser, verificationUnbanUser, verificationBanList)
    );

export { verificationCommand };
