//TODO: add the ability to remove your latest reminder and clear all of your reminders

import { Client, CommandInteraction, Message } from "discord.js";
import * as database from "./../../database";
import { consoleCheck } from "../../helpers/core/logger";
import parseMessagePlaceholderFromString from "../../helpers/text/parseMessagePlaceholderFromString";

export default {
	name: "reminder",
	help: {
		description: "Sets a reminder",
		syntax: "{prefix}reminder `<time>`\n{prefix}reminder `<time>` `<message>`",
		"time format": "`s`: seconds, `m`: minutes, `h`: hours, `d`: days",
		example:
			"{prefix}reminder `30m` `Remind me to do something`\n{prefix}reminder `1d`",
	},
	config: {
		type: 1,
		options: [
			{
				name: "time",
				description: "Set the time for the reminder",
				type: 3,
				max_value: 1,
				required: true,
			},
			{
				name: "content",
				description: "Reminder content",
				type: 3,
				max_value: 1,
				required: true,
			},
		],
	},
	category: "misc",
	interaction: true,
	run: async (
		bot: Client,
		interaction: CommandInteraction,
		args: string[]
	) => {
		await interaction.deferReply(); // ? prevent errors

		if (!interaction.guild) return;

		const user = await database.users.findOne({ _id: interaction.user.id });

		if (!user) return;
		const guild = await database.guilds.findOne({
			_id: interaction.guild.id,
		});

		if (!guild) return;

		if (!user.reminders) user.reminders = [];

		if (user.reminders.length >= 10)
			return interaction.editReply({
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

		const timeInput = interaction.options.get("time");
		const contentInput = interaction.options.get("content");

		// ? This never will break, cuz all fields are required.
		if (
			!timeInput ||
			!timeInput.value ||
			!contentInput ||
			!contentInput.value ||
			!interaction.channel
		)
			return;

		const re = /^[0-9]+[smhd]{1}$/g;

		if (!re.test(timeInput.value.toString()))
			return interaction.editReply({
				embeds: [
					{
						title: "❌ Invalid time format",
						description: "time format: `s`: seconds, `m`: minutes, `h`: hours, `d`: days\nExample: `/reminder time:30m content:Remind me to do something`",
						color: "#ff5050",
					},
				],
				allowedMentions: {
					repliedUser: false,
				},
			});

		const measure = timeInput.value
			.toString()
			.substring(
				timeInput.value.toString().length - 1,
				timeInput.value.toString().length
			);

		let time = Number(
			timeInput.value
				.toString()
				.substring(0, timeInput.value.toString().length - 1)
		);

		let normalizedTime = "";

		// ? Based off the delimiter, sets the time
		switch (measure) {
			case "s":
				normalizedTime =
					time == 1 ? `${time} second` : `${time} seconds`;
				time = time * 1000;
				break;

			case "m":
				normalizedTime =
					time == 1 ? `${time} minute` : `${time} minutes`;
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
				normalizedTime =
					time == 1 ? `${time} second` : `${time} seconds`;
				time = time * 1000;
				break;
		}

		// ? set max allowed date to 2 years
		if (time > 1000 * 60 * 60 * 24 * 365 * 2)
			return interaction.editReply({
				embeds: [
					{
						title: "❌ Invalid time format",
						description:
							"You can only set reminders for up to 2 years. (730 days)",
						color: "#ff5050",
					},
				],
				allowedMentions: {
					repliedUser: false,
				},
			});

		const message_ = contentInput.value.toString().trim();

        // ? limit reminder message to 1000 characters
        if (message_.length > 1000)
        return interaction.editReply({
            embeds: [
                {
                    title: "❌ Message too long",
                    description:
                        "Reminder message can only be up to 1000 characters long.",
                    color: "#ff5050",
                },
            ],
            allowedMentions: {
                repliedUser: false,
            },
        });

		const reminder = {
			time: new Date().getTime() + time,
            creationTime: new Date().getTime(),
			message: message_,
			channel: interaction.channel.id,
			guild: interaction.guild.id,
		};
		user.reminders.push(reminder);

		await database.users.updateOne(
			{ _id: interaction.user.id },
			{ $set: { reminders: user.reminders } }
		);

		interaction.editReply({
			embeds: [
				{
					title: "✅ Reminder Set!",
					fields: [
						{
							name: "Time",
							value: `${normalizedTime} (<t:${Math.trunc(
								reminder.time / 1000
							)}:R>)`,
						},
						{
							name: "Message",
							value:
								message_.length > 0 ? message_ : "*No message*",
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
			`${interaction.user.tag} set a reminder in ${interaction.guild.name}`
		);
	},
};
