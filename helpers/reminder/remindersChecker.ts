/**
 * ?description: This function is used to check for each user if a reminder date matches the current date, and sends a message if true.
 *
 */

import moment from "moment";
import { Client, TextChannel } from "discord.js";
import * as database from "../../database";
import { consoleCheck } from "../../helpers/core/logger";
import { findIndex } from "lodash";

export interface IReminder {
	time: moment.MomentInput;
	guild: string;
	channel: string;
	message: any;
}

export default async (bot: Client) => {
	let users = await database.users.find();

	const ReminderQueue: IReminder[] = [];
	users.forEach((user) => {
		if (user.reminders.length < 1) return;

		user.reminders.forEach(async (reminder: IReminder) => {
			if (moment().diff(moment(reminder.time), "seconds") >= 0) {
				let guild = bot.guilds.cache.get(reminder.guild);

				if (!guild) return;

				let channel = (await bot.channels.fetch(
					reminder.channel
				)) as TextChannel;

				if (!channel) return;
				const reminderIndex = user.reminders.indexOf(reminder);

				const currentReminder = ReminderQueue.find(
					(r) => r == reminder
				);

				if (currentReminder) return;

				ReminderQueue.push(reminder);

				channel.send(`<@${user._id}> ${reminder.message}`);
				await guild.members.fetch(user._id).then((member) => {
					consoleCheck(
						"remindersChecker.ts",
						`Reminder sent to ${member.user.tag} in ${
							guild ? guild.name : "unknown guild"
						}`
					);
				});

				user.reminders.splice(reminderIndex, 1);
				await database.users.findByIdAndUpdate(user._id, user);

				const reminderQueueIndex = ReminderQueue.indexOf(reminder);
				ReminderQueue.splice(reminderQueueIndex, 1);
			}
		});
	});
};
