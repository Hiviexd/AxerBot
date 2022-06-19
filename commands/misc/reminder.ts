import { Client, Message, MessageEmbed } from "discord.js";
import * as database from "./../../database";

export default {
	name: "reminder",
	help: {
		description: "Sets a reminder",
		syntax: "{prefix}reminder `<time>` `<message>`",
		example: "{prefix}reminder `1d` `Remind me to do something`",
	},
	category: "misc",
	run: async (bot: Client, message: Message, args: string[]) => {
		if (!message.guild) return;
		const user = await database.users.findOne({ _id: message.author.id });
		if (!user) return;
		if (!user.reminders) user.reminders = [];
		if (user.reminders.length >= 10)
			return message.reply({
				embeds: [
					{
						title: "Reminder Limit Reached",
						description: "You can only have 10 reminders at once.",
						color: 0xff0000,
					},
				],
                allowedMentions: {
					repliedUser: false,
				},
			});
		if (args.length < 2)
			return message.reply({
				embeds: [
					{
						title: "Invalid Arguments",
						description: "You must provide a time and message.",
						color: 0xff0000,
					},
				],
				allowedMentions: {
					repliedUser: false,
				},
			});

		const re = /^[0-9]+[smhd]{1}$/g;
		if (!re.test(args[0]))
			return message.channel.send({
				embeds: [
					{
						title: "Invalid Arguments",
						description: "You must provide a valid time.",
						color: 0xff0000,
					},
				],
                allowedMentions: {
					repliedUser: false,
				},
			});
		const measure = args[0].substring(args[0].length - 1, args[0].length);
		let time = Number(args[0].substring(0, args[0].length - 1));
		// Based off the delimiter, sets the time
		switch (measure) {
			case "s":
				time = time * 1000;
				break;

			case "m":
				time = time * 1000 * 60;
				break;

			case "h":
				time = time * 1000 * 60 * 60;
				break;

			case "d":
				time = time * 1000 * 60 * 60 * 24;
				break;

			default:
				time = time * 1000;
				break;
		}
		//set max allowed date to 2 years
		if (time > 1000 * 60 * 60 * 24 * 365 * 2)
			return message.reply({
				embeds: [
					{
						title: "Invalid Arguments",
						description:
							"You can only set reminders for up to 2 years! (730 days)",
						color: 0xff0000,
					},
				],
                allowedMentions: {
					repliedUser: false,
				},
			});
		const message_ = args.slice(1).join(" ");
		const reminder = {
			time: new Date().getTime() + time,
			message: message_,
			channel: message.channel.id,
			guild: message.guild.id,
		};
		user.reminders.push(reminder);
		await database.users.updateOne({ _id: message.author.id }, { $set: { reminders: user.reminders } });
		message.channel.send(`timestamp: ${reminder.time}`);
		message.reply({
			embeds: [
				{
					title: "Reminder Set",
					description: `Reminder set for: ${Math.trunc(reminder.time / 1000)} / <t:${Math.trunc(reminder.time / 1000)}:R>
                                \nMessage: ${reminder.message}`,
					color: 0x00ff00,
				},
			],
            allowedMentions: {
                repliedUser: false,
            },
		});
	},
};
