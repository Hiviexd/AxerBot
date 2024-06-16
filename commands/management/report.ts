import { SlashCommand } from "../../models/commands/SlashCommand";
import { SlashCommandSubcommandGroup } from "../../models/commands/SlashCommandSubcommandGroup";
import { CommandCategory } from "../../struct/commands/CommandCategory";
import { reportSetChannel } from "./subcommands/report/reportSetChannel";
import { reportSetDisabled } from "./subcommands/report/reportSetDisabled";
import { reportSetNoPing } from "./subcommands/report/reportSetNoPing";
import { reportSetPing } from "./subcommands/report/reportSetPing";
import { reportStatus } from "./subcommands/report/reportStatus";
import { reportUser } from "./subcommands/report/reportUser";

const report = new SlashCommand()
    .setName("report")
    .setDescription("Report an user to the server staff team")
    .setCategory(CommandCategory.Management)
    .addSubcommands(reportUser, reportStatus)
    .addSubcommandGroups(
        new SlashCommandSubcommandGroup()
            .setName("set")
            .setDescription("Set a value to a module option")
            .addCommands(reportSetChannel, reportSetDisabled, reportSetPing),
        new SlashCommandSubcommandGroup()
            .setName("disable")
            .setDescription("Disable an option from this module")
            .addCommands(reportSetNoPing)
    );

export { report };
