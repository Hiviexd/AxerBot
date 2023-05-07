import status from "statuses";
import { SlashCommand } from "../../models/commands/SlashCommand";
import { SlashCommandSubcommandGroup } from "../../models/commands/SlashCommandSubcommandGroup";

import reportUser from "./subcommands/report/reportUser";
import reportStatus from "./subcommands/report/reportStatus";
import reportSetChannel from "./subcommands/report/reportSetChannel";
import reportSetDisabled from "./subcommands/report/reportSetDisabled";
import reportSetPing from "./subcommands/report/reportSetPing";
import reportSetNoPing from "./subcommands/report/reportSetNoPing";

const report = new SlashCommand(
    "report",
    "Report a user to the server staff team.",
    "Management",
    false
);

report.addSubcommand(reportUser);
report.addSubcommand(reportStatus);

const commandGroupSET = new SlashCommandSubcommandGroup(
    "set",
    "Set a value to a module option."
);

commandGroupSET
    .addCommand(reportSetChannel)
    .addCommand(reportSetDisabled)
    .addCommand(reportSetPing);

const commandGroupDISABLE = new SlashCommandSubcommandGroup(
    "disable",
    "Disable a module."
);

commandGroupDISABLE.addCommand(reportSetNoPing);

report
    .addSubcommandGroup(commandGroupSET)
    .addSubcommandGroup(commandGroupDISABLE);

export default report;
