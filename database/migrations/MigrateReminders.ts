import { ChatInputCommandInteraction } from "discord.js";
import { reminders, users } from "..";
import { randomBytes } from "crypto";

export default {
    name: "migratereminders",
    run: async (command: ChatInputCommandInteraction) => {
        const allUsers = await users.find();

        const usersWithReminders = allUsers.filter(
            (u) => u.reminders && u.reminders.length > 0
        );

        for (const user of usersWithReminders) {
            /**
             * 
                time: 1683669771824
                creationTime: 1683666171824
                message: "test"
                channel: "950107895754784908"
                guild: 589557574702071819"
             */
            await reminders.create(
                user.reminders.map((reminder) => {
                    if (
                        reminder.creationTime &&
                        reminder.time &&
                        reminder.message &&
                        reminder.channel &&
                        reminder.guild
                    )
                        return {
                            _id: randomBytes(15).toString("hex"),
                            sendAt: reminder.time,
                            createdAt: reminder.creationTime,
                            content: reminder.message,
                            channelId: reminder.channel,
                            guildId: reminder.guild,
                            userId: user._id,
                            parentMessageId: undefined,
                            isPrivate: false,
                        };
                })
            );

            user.reminders = [];

            await user.save();
        }

        return true;
    },
};
