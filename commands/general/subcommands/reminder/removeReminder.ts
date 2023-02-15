/**
 * TODO: Add a confirmation message before deleting reminders
 */
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import colors from "../../../../constants/colors";
import * as database from "../../../../database";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
interface IReminder {
    time: number;
    creationTime: number;
    message: string;
    channel: string;
    guild: string;
}

const removeReminder = new SlashCommandSubcommand(
    "remove",
    "remove a reminder",
    false
);

removeReminder.builder.addIntegerOption((option) =>
    option
        .setName("index")
        .setDescription("Use /reminder list to get a reminder index")
        .setRequired(true)
        .setMinValue(0)
);

removeReminder.setExecuteFunction(async (command) => {
    const index = command.options.getInteger("index", true);

    let user = await database.users.findById(command.user.id);
    if (!user) return;

    const reminders: IReminder[] = user.reminders;
    if (!reminders)
        return command.reply({
            embeds: [generateErrorEmbed("You have no reminders to remove!")],
        });

    if (index > reminders.length || index < 1)
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "That is not a valid reminder index! Use /reminder list to get a reminder index"
                ),
            ],
        });

    const reminderMessage = reminders[index - 1].message;
    reminders.splice(index - 1, 1);

    await database.users.findByIdAndUpdate(command.user.id, {
        reminders: reminders,
    });

    const embed = new EmbedBuilder()
        .setTitle("🗑️ Reminder Removed")
        .setDescription(`Removed reminder at index ${index}`)
        .addFields({
            name: "Reminder",
            value: reminderMessage,
        });

    return command.editReply({ embeds: [embed] });
});

export default removeReminder;
