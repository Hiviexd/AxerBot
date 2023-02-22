import { SlashCommand } from "../../models/commands/SlashCommand";
import listReminders from "./subcommands/reminder/listReminders";
import createReminder from "./subcommands/reminder/createReminder";
import removeReminder from "./subcommands/reminder/removeReminder";

const reminder = new SlashCommand(
    "reminder",
    "Sets a reminder",
    "General",
    false,
    {
        syntax: "/reminder `<time>`\n/reminder `<time>` `<message>`",
        "time format": "`s`: seconds, `m`: minutes, `h`: hours, `d`: days",
        example: "/reminder `30m` `Remind me to do something`\n/reminder `1d`",
    }
);

reminder.addSubcommand(listReminders);
reminder.addSubcommand(createReminder);
reminder.addSubcommand(removeReminder);

reminder.setExecuteFunction(async (command) => {});

export default reminder;
