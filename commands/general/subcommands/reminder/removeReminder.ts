import { EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { generateStepEmbedWithChoices } from "../../../../helpers/commands/generateStepEmbedWithChoices";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import truncateString from "../../../../helpers/text/truncateString";
import { vanillaRelativeTime } from "../../../../helpers/text/vanillaRelativeDate";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import generateErrorEmbedWithTitle from "../../../../helpers/text/embeds/generateErrorEmbedWithTitle";
import { reminders } from "../../../../database";

const removeReminder = new SlashCommandSubcommand()
    .setName("remove")
    .setDescription("Remove one or more reminders")
    .setEphemeral(true);

removeReminder.setExecutable(async (command) => {
    const userReminders = await reminders.find({ userId: command.user.id });

    if (!userReminders || userReminders.length == 0)
        return command.editReply({
            embeds: [generateErrorEmbed("You have no reminders to remove!")],
        });

    const remindersSelectMenu = new StringSelectMenuBuilder()
        .setPlaceholder("Select a reminder")
        .setMinValues(1);

    userReminders.forEach((r, i) => {
        remindersSelectMenu.addOptions({
            label: `#${i + 1} | (${vanillaRelativeTime(new Date(r.sendAt || ""), new Date())})`,
            description: `${truncateString(r.content || "No Content", 25, true)}`,
            value: r._id,
        });

        remindersSelectMenu.setMaxValues(i + 1);
        remindersSelectMenu.setMinValues(1);
    });

    console.log(remindersSelectMenu.data.min_values, remindersSelectMenu.data.max_values);

    generateStepEmbedWithChoices(
        command,
        "📑 Select a reminder to remove",
        "You can select up to 25 reminders",
        remindersSelectMenu
    )
        .then(async (options) => {
            for (const reminderId of options.data) {
                await reminders.findByIdAndDelete(reminderId);
            }

            const embed = new EmbedBuilder()
                .setTitle("🗑️ Reminder Removed")
                .setDescription(`Removed ${options.data.length} reminder(s)`);

            return command.editReply({ content: "", embeds: [embed] });
        })
        .catch((e: any) => {
            if (e.reason == "timeout")
                return command.editReply({
                    content: "",
                    embeds: [
                        generateErrorEmbedWithTitle(
                            "Don't leave me waiting!",
                            "Please, do the things during the right time."
                        ),
                    ],
                });

            console.error(e);

            command.editReply({
                content: "",
                embeds: [generateErrorEmbedWithTitle("Error", "Something went wrong...")],
            });
        });
});

export { removeReminder };
