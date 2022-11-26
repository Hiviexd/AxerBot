import { Client, CommandInteraction, MessageEmbed } from "discord.js";
import * as database from "../../database";
import moment from "moment";
import add from "./subcommands/userLog/add";
import remove from "./subcommands/userLog/remove";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import truncateString from "../../helpers/text/truncateString";

// TODO: consider using forms for reason input

export default {
	name: "userlog",
	help: {
		description: "logs info about a user",
		syntax: "{prefix}userlog `<add/remove/list>` `<user>` `<reason>`",
		example: "{prefix}userlog `add` `@user` `reason`",
		options: ["`add`", "`remove`", "`list`"],
	},
	subcommands: [add, remove],
	category: "management",
	interaction: true,
	config: {
		type: 1,
		options: [
			{
				name: "list",
				type: 1,
				description: "List all logs of a user",
				options: [
					{
						name: "username",
						type: 3,
						description: "The user to list logs of",
						required: true,
					},
				],
			},
			{
				name: "add",
				type: 2,
				description: "log a user",
				options: [
					{
						name: "log",
						type: 1,
						description: "log a user",
						options: [
							{
								name: "username",
								type: 3,
								description: "user to log",
								required: true,
							},
							{
								name: "reason",
								type: 3,
								description: "reason for logging",
								required: true,
							},
						],
					},
				],
			},
			{
				name: "remove",
				type: 2,
				description: "remove a log from a user",
				options: [
					{
						name: "log",
						type: 1,
						description: "remove a log from a user",
						options: [
							{
								name: "username",
								type: 3,
								description: "user to remove log from",
								required: true,
							},
							{
								name: "logid",
								type: 4,
								description: "id of log to remove",
								required: true,
							},
						],
					},
				],
			},
		],
	},
	permissions: ["MANAGE_MEMBERS"],
	run: async (bot: Client, command: CommandInteraction, args: string[]) => {
		await command.deferReply();

		if (!command.member || typeof command.member.permissions == "string")
			return;

		let guild = await database.guilds.findById(command.guildId);
		if (!guild) return;

		const username = command.options
			.getString("username", true)
			.toLowerCase();

		const userLogs = guild.user_logs.find(
			(log) => log.username == username
		);

		if (!userLogs) {
			await command.editReply({
				embeds: [generateErrorEmbed("User not found")],
			});
			return;
		} else {
			//sort userlogs by date from newest to oldest
			userLogs.logs.sort((a, b) => {
				return (
					new Date(b.date || new Date()).valueOf() -
					new Date(a.date || new Date()).valueOf()
				);
			});
		}

		const embed = new MessageEmbed()
			.setTitle(`📙 Logs for ${username.toLowerCase()}`)
			.setColor("#ffaa00");

		if (userLogs.logs.length == 0) {
			embed.setDescription("*No logs found*");
		}

		userLogs.logs.forEach((log) => {
			embed.addField(
				`Log #${userLogs.logs.indexOf(log) + 1}`,
				`<t:${moment(log.date).unix()}:R> | ${truncateString(
					log.reason ? log.reason : "No reason provided",
					1024
				)}`,
				false
			);
		});

		await command.editReply({ embeds: [embed] });
	},
};
