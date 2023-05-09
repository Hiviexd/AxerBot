import { EmbedBuilder } from "discord.js";
import colors from "../../constants/colors";
import { ReminderType } from "../../modules/reminders/remindersChecker";

export const ReminderEmbed = (reminder: ReminderType) => {
    const embed = new EmbedBuilder()
        .setColor(colors.yellow)
        .setTitle("🔔 Reminder")
        .setDescription(reminder.content || "_Invalid content..._")
        .setTimestamp();

    return embed;
};
