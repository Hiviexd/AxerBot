import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import { users, guilds } from "../../../../database/";
import { EmbedBuilder } from "discord.js";
import colors from "../../../../constants/colors";
import generateErrorEmbedWithTitle from "../../../../helpers/text/embeds/generateErrorEmbedWithTitle";
import { consoleCheck } from "../../../../helpers/core/logger";

export const createReminder = new SlashCommandSubcommand(
    "new",
    "create a new reminder",
    false
);

createReminder.builder
    .addStringOption((option) =>
        option
            .setName("time")
            .setDescription("Time of the reminder")
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName("content")
            .setDescription("Content of the reminder")
            .setRequired(true)
    );

createReminder.setExecuteFunction(async (command) => {
    await command.deferReply(); // ? prevent errors

    if (!command.guild) return;

    const user = await users.findOne({ _id: command.user.id });

    if (!user) return;
    const guild = await guilds.findOne({
        _id: command.guild.id,
    });

    if (!guild) return;

    if (!user.reminders) user.reminders = [];

    if (user.reminders.length >= 10)
        return command.editReply({
            embeds: [
                generateErrorEmbedWithTitle(
                    "❗ Reminder limit reached",
                    "You can only have 10 reminders at once."
                ),
            ],
        });

    const timeInput = command.options.getString("time", true);
    const contentInput = command.options.getString("content", true);

    // ? This never will break, cuz all fields are required.
    if (!command.channel) return;

    const re = /^[0-9]+[smhd]{1}$/g;

    if (!re.test(timeInput))
        return command.editReply({
            embeds: [
                generateErrorEmbedWithTitle(
                    "❌ Invalid time format",
                    "time format: `s`: seconds, `m`: minutes, `h`: hours, `d`: days\nExample: `/reminder time:30m content:Remind me to do something`"
                ),
            ],
            allowedMentions: {
                repliedUser: false,
            },
        });

    const measure = timeInput.substring(
        timeInput.toString().length - 1,
        timeInput.length
    );

    let time = Number(timeInput.substring(0, timeInput.length - 1));

    let normalizedTime = "";

    // ? Based off the delimiter, sets the time
    switch (measure) {
        case "s":
            normalizedTime = time == 1 ? `${time} second` : `${time} seconds`;
            time = time * 1000;
            break;

        case "m":
            normalizedTime = time == 1 ? `${time} minute` : `${time} minutes`;
            time = time * 1000 * 60;
            break;

        case "h":
            normalizedTime = time == 1 ? `${time} hour` : `${time} hours`;
            time = time * 1000 * 60 * 60;
            break;

        case "d":
            normalizedTime = time == 1 ? `${time} day` : `${time} days`;
            time = time * 1000 * 60 * 60 * 24;
            break;

        default:
            normalizedTime = time == 1 ? `${time} second` : `${time} seconds`;
            time = time * 1000;
            break;
    }

    // ? set max allowed date to 2 years
    if (time > 1000 * 60 * 60 * 24 * 365 * 2)
        return command.editReply({
            embeds: [
                generateErrorEmbedWithTitle(
                    "❌ Invalid time format",
                    "You can only set reminders for up to 2 years. (730 days)"
                ),
            ],
            allowedMentions: {
                repliedUser: false,
            },
        });

    const message_ = contentInput.trim();

    // ? limit reminder message to 1000 characters
    if (message_.length > 1000)
        return command.editReply({
            embeds: [
                generateErrorEmbedWithTitle(
                    "❌ Message too long",
                    "Reminder message can only be up to 1000 characters long."
                ),
            ],
            allowedMentions: {
                repliedUser: false,
            },
        });

    const reminder = {
        time: new Date().getTime() + time,
        creationTime: new Date().getTime(),
        message: message_,
        channel: command.channel.id,
        guild: command.guild.id,
    };
    user.reminders.push(reminder);

    await users.updateOne(
        { _id: command.user.id },
        { $set: { reminders: user.reminders } }
    );

    const successEmbed = new EmbedBuilder()
        .setTitle("✅ Reminder Set!")
        .addFields(
            {
                name: "Time",
                value: `${normalizedTime} (<t:${Math.trunc(
                    reminder.time / 1000
                )}:R>)`,
            },
            {
                name: "Message",
                value: message_.length > 0 ? message_ : "*No message*",
            }
        )
        .setColor(colors.green);

    command.editReply({
        embeds: [successEmbed],
        allowedMentions: {
            repliedUser: false,
        },
    });

    consoleCheck(
        "reminder.ts",
        `${command.user.tag} set a reminder in ${command.guild.name}`
    );
});

export default createReminder;
