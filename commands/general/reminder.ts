import { SlashCommand } from "../../models/commands/SlashCommand";
import { listReminders } from "./subcommands/reminder/listReminders";
import { createReminder } from "./subcommands/reminder/createReminder";
import { removeReminder } from "./subcommands/reminder/removeReminder";
import { CommandCategory } from "../../struct/commands/CommandCategory";

const reminder = new SlashCommand()
    .setName("reminder")
    .setDescription("I will remind you about something")
    .setCategory(CommandCategory.General)
    .setDMPermission(true)
    .addSubcommand(createReminder)
    .addSubcommand(listReminders)
    .addSubcommand(removeReminder);

export { reminder };
