import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import { users } from "../../../../database/";
import { EmbedBuilder } from "discord.js";
import colors from "../../../../constants/colors";
import generateErrorEmbedWithTitle from "helpers/text/embeds/generateErrorEmbedWithTitle";

export const listReminders = new SlashCommandSubcommand(
    "list",
    "Shows your currently active reminders"
);

listReminders.setExecuteFunction(async (command) => {
    const user = await users.findById(command.user.id);

    if (!user) return;

    const userReminders = user.reminders;

    const listEmbed = new EmbedBuilder()
        .setTitle("⏰ Your active reminders")
        .setColor(colors.gold);

    if (userReminders.length == 0) {
        listEmbed.setDescription("*No reminders found*");
    }

    userReminders.forEach((reminder) => {
        listEmbed.addFields({
            name: `Reminder #${userReminders.indexOf(reminder) + 1}`,
            value: `<t:${Math.trunc(reminder.time / 1000)}:R> | ${
                reminder.message
            }`,
        });
    });

    return command.editReply({
        embeds: [listEmbed],
    });
});

export default listReminders;
