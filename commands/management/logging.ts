import { SlashCommand } from "../../models/commands/SlashCommand";
import { loggingChannel } from "./subcommands/logging/channel";
import { loggingStatus } from "./subcommands/logging/status";
import { loggingToggle } from "./subcommands/logging/toggle";
import { CommandCategory } from "../../struct/commands/CommandCategory";

const logging = new SlashCommand()
    .setName("logging")
    .setDescription("Configure logging system")
    .setCategory(CommandCategory.Management)
    .setPermissions("ManageGuild")
    .addSubcommands(loggingChannel, loggingStatus, loggingToggle);

export { logging };
