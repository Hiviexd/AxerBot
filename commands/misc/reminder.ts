//TODO: add the ability to remove your latest reminder and clear all of your reminders

import { Client, Message } from "discord.js";
import * as database from "./../../database";
import { consoleCheck } from "../../helpers/core/logger";
import parseMessagePlaceholderFromString from "../../helpers/text/parseMessagePlaceholderFromString";

export default {
	name: "reminder",
	help: {
		description: "Sets a reminder",
		syntax: "{prefix}reminder `<time>`\n{prefix}reminder `<time>` `<message>`",
        "time format": "`s`: seconds, `m`: minutes, `h`: hours, `d`: days",
		example: "{prefix}reminder `30m` `Remind me to do something`\n{prefix}reminder `1d`",
	},
	category: "misc",
	run: async (bot: Client, message: Message, args: string[]) => {
		if (!message.guild) return;
		const user = await database.users.findOne({ _id: message.author.id });
		if (!user) return;
        const guild = await database.guilds.findOne({ _id: message.guild.id });
        if (!guild) return;
		if (!user.reminders) user.reminders = [];
		if (user.reminders.length >= 10)
			return message.reply({
				embeds: [
					{
						title: "❗ Reminder limit reached",
						description: "You can only have 10 reminders at once.",
                        color: "#ff5050",
					},
				],
				allowedMentions: {
					repliedUser: false,
				},
			});
		if (args.length < 1)
			return message.reply({
				embeds: [
                    {
						title: "❌ Invalid syntax",
						description: parseMessagePlaceholderFromString(
                            message,
                            guild,
                            "Use \`{prefix}reminder <time> <message>\` to set a reminder."
                        ),
                        color: "#ff5050",
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
                        title: "❌ Invalid time format",
                        description: parseMessagePlaceholderFromString(
                            message,
                            guild,
                            "check \`{prefix}help reminder\` for more info."
                        ),
                        color: "#ff5050",
                    },
				],
                allowedMentions: {
					repliedUser: false,
				},
			});

		const measure = args[0].substring(args[0].length - 1, args[0].length);

		let time = Number(args[0].substring(0, args[0].length - 1));

		let normalizedTime = "";

		// Based off the delimiter, sets the time
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

		//set max allowed date to 2 years
		if (time > 1000 * 60 * 60 * 24 * 365 * 2)
			return message.reply({
				embeds: [
					{
                        title: "❌ Invalid time format",
                        description: "You can only set reminders for up to 2 years. (730 days)",
                        color: "#ff5050",
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
		message.reply({
			embeds: [
				{
					title: "✅ Reminder Set!",
					fields: [
                        {
                            name: "Time",
                            value: `${normalizedTime} (<t:${Math.trunc(reminder.time / 1000)}:R>)`,
                        },
                        {
                            name: "Message",
                            value: message_.length > 0 ? message_ : "*No message*",
                        },
                    ],
                    color: "#1df27d",
				},
			],
            allowedMentions: {
                repliedUser: false,
            },
		});

        consoleCheck(
            "reminder.ts",
            `${message.author.tag} set a reminder in ${message.guild.name}`
            );
	},
};
