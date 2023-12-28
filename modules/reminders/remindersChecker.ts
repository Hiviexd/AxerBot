/**
 * ?description: This function is used to check for each user if a reminder date matches the current date, and sends a message if true.
 */

import moment from "moment";
import { AxerBot } from "../../models/core/AxerBot";
import { LoggerClient } from "../../models/core/LoggerClient";
import { reminders } from "../../database";
import { HydratedDocument } from "mongoose";
import { ReminderEmbed } from "../../responses/embeds/ReminderEmbed";

export interface IReminder {
    time: moment.MomentInput;
    creationTime: moment.MomentInput;
    guild: string;
    channel: string;
    message: any;
}

export type ReminderType = HydratedDocument<{
    type?: boolean | undefined;
    _id?: string | undefined;
    content?: string | undefined;
    channelId?: string | undefined;
    parentMessageId?: string | undefined;
    guildId?: string | undefined;
    userId?: string | undefined;
    createdAt?: Date | undefined;
    sendAt?: Date | undefined;
}>;

export enum ReminderTargetType {
    Private = "private",
    Public = "public",
}

export class RemindersManager {
    public axer: AxerBot;
    private Logger = new LoggerClient("RemindersManager");

    constructor(axer: AxerBot) {
        this.axer = axer;
    }

    async start() {
        const allReminders = await reminders.find();

        if (!allReminders) return this.Logger.printError("Can't fetch reminders!");

        const remindersAvailableForSend = allReminders.filter(
            (r: (typeof allReminders)[0]) => moment().diff(moment(r.sendAt), "seconds") >= 0
        );

        for (const reminder of remindersAvailableForSend) {
            if (!reminder.isPrivate) {
                const publicReminderResult = await this.sendPublicReminder(reminder);

                publicReminderResult.status == 200
                    ? this.Logger.printSuccess(publicReminderResult.message)
                    : this.Logger.printError(publicReminderResult.message);
            }

            if (reminder.isPrivate) await this.sendPrivateReminder(reminder);

            await reminder.delete();
        }

        setTimeout(async () => {
            await this.start();
        }, 5000);
    }

    async sendPublicReminder(reminder: ReminderType) {
        try {
            if (!reminder.channelId || !reminder.guildId)
                return {
                    status: 400,
                    message: "Missing channelId or guildId",
                };

            const channel = await this.axer.channels.fetch(reminder.channelId);

            if (!channel)
                return {
                    status: 404,
                    message: "Channel not found!",
                };

            if (!channel.isTextBased())
                return {
                    status: 404,
                    message: "Channel not found!",
                };

            const reminderEmbed = ReminderEmbed(reminder);

            await channel.send({
                content: `<@${reminder.userId}>`,
                embeds: [reminderEmbed],
            });

            return {
                status: 200,
                message: `Sent reminder ${reminder.id}`,
            };
        } catch (e: any) {
            console.error(e);

            return {
                status: e.code || e.status,
                message: e.message,
            };
        }
    }

    async sendPrivateReminder(reminder: ReminderType) {
        try {
            if (!reminder.userId)
                return {
                    status: 400,
                    message: "Missing userId",
                };

            const user = await this.axer.users.fetch(reminder.userId);

            const userDMChannel = await user.createDM();

            const reminderEmbed = ReminderEmbed(reminder);

            await userDMChannel.send({
                content: `<@${reminder.userId}>`,
                embeds: [reminderEmbed],
            });

            return {
                status: 200,
                message: `Sent reminder ${reminder.id}`,
            };
        } catch (e: any) {
            console.error(e);

            return {
                status: e.code || e.status,
                message: e.message,
            };
        }
    }
}

// export default remindersChecker;
