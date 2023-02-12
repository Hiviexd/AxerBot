import { PermissionFlagsBits } from "discord.js";
import { SlashCommand } from "../../models/commands/SlashCommand";
import loggingChannel from "./subcommands/logging/channel";
import loggingStatus from "./subcommands/logging/status";
import loggingToggle from "./subcommands/logging/toggle";

const logging = new SlashCommand(
    "logging",
    "Configure the logging system",
    "management",
    false,
    undefined,
    [PermissionFlagsBits.ManageGuild]
);

logging.setExecuteFunction(() => {});
logging
    .addSubcommand(loggingChannel)
    .addSubcommand(loggingStatus)
    .addSubcommand(loggingToggle);

export default logging;
