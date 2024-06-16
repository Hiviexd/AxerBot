import { EmbedBuilder } from "discord.js";

import colors from "../../../../constants/colors";
import { reminders } from "../../../../database/";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const listReminders = new SlashCommandSubcommand()
    .setName("list")
    .setDescription("Show your currently active reminders")
    .setEphemeral(true);

listReminders.setExecutable(async (command) => {
    const userReminders = await reminders.find({
        userId: command.user.id,
    });

    const listEmbed = new EmbedBuilder().setTitle("⏰ Your active reminders").setColor(colors.gold);

    if (userReminders.length == 0) {
        listEmbed.setDescription("*No reminders found*");
    }

    userReminders.forEach((reminder) => {
        listEmbed.addFields({
            name: `Reminder #${userReminders.indexOf(reminder) + 1}`,
            value: `<t:${Math.trunc(
                new Date(reminder.sendAt || new Date()).valueOf() / 1000
            )}:R> | ${
                reminder.parentMessageId
                    ? `https://discord.com/channels/${reminder.guildId || "@me"}/${
                          reminder.channelId
                      }/${reminder.parentMessageId}`
                    : `[Go to Guild](https://discord.com/channels/${reminder.guildId})`
            } | ${reminder.content} `,
        });
    });

    return command.editReply({
        embeds: [listEmbed],
    });
});

export { listReminders };
