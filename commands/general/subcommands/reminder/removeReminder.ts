import { EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import * as database from "../../../../database";
import { generateStepEmbedWithChoices } from "../../../../helpers/commands/generateStepEmbedWithChoices";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import truncateString from "../../../../helpers/text/truncateString";
import { vanillaRelativeTime } from "../../../../helpers/text/vanillaRelativeDate";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import generateErrorEmbedWithTitle from "../../../../helpers/text/embeds/generateErrorEmbedWithTitle";

interface IReminder {
    time: number;
    creationTime: number;
    message: string;
    channel: string;
    guild: string;
}

const removeReminder = new SlashCommandSubcommand(
    "remove",
    "remove a reminder"
);

removeReminder.setExecuteFunction(async (command) => {
    let user = await database.users.findById(command.user.id);
    if (!user) return;

    const reminders: IReminder[] = user.reminders;
    if (!reminders)
        return command.reply({
            embeds: [generateErrorEmbed("You have no reminders to remove!")],
        });

    const remindersSelectMenu = new StringSelectMenuBuilder()
        .setPlaceholder("Select a reminder")
        .setMinValues(1);

    reminders.forEach((r, i) => {
        remindersSelectMenu.addOptions({
            label: `#${i + 1} | (${vanillaRelativeTime(
                new Date(r.time),
                new Date()
            )}) ${truncateString(r.message, 25, true)}`,
            value: i.toString(),
        });
    });

    generateStepEmbedWithChoices(
        command,
        "📑 Select a reminder to remove",
        "You can select up to 25 reminders",
        remindersSelectMenu
    )
        .then(async (options) => {
            const updatedReminders = reminders.filter(
                (r, i) => !options.data.includes(i.toString())
            );

            await database.users.findByIdAndUpdate(command.user.id, {
                reminders: updatedReminders,
            });

            const embed = new EmbedBuilder()
                .setTitle("🗑️ Reminder Removed")
                .setDescription(`Removed ${options.data.length} reminder(s)`)
                .addFields({
                    name: "Reminders",
                    value: reminders
                        .filter((r, i) => options.data.includes(i.toString()))
                        .map(
                            (r, i) =>
                                `**#${i + 1} |** (<t:${Math.trunc(
                                    r.time / 1000
                                )}:R>) ${truncateString(r.message, 25, true)}`
                        )
                        .join("\n"),
                });

            return command.editReply({ content: "", embeds: [embed] });
        })
        .catch((e) => {
            return command.editReply({
                content: "",
                embeds: [
                    generateErrorEmbedWithTitle(
                        "Don't leave me waiting!",
                        "Please, do the things during the right time."
                    ),
                ],
            });
        });
});

export default removeReminder;
