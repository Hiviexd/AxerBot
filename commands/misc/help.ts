import { Client, Message } from "discord.js";
import parseMessagePlaceholderFromString from "../../helpers/text/parseMessagePlaceholderFromString";
import commands from "./../";
import CommandNotFound from "./../../data/embeds/CommandNotFound";
export default {
	name: "help",
	category: "misc",
	run: async (bot: Client, message: Message, args: string[]) => {
		const options: any[] = [];
		const categories: string[] = [];
		let requested_command: any = args[0];
		requested_command = commands[requested_command];
		let subcommand: any = args.slice(1, args.length);

		Object.keys(commands).forEach((key) => {
			options.push({
				name: commands[key].name,
				syntax: commands[key].syntax,
				description: commands[key].description,
				example: commands[key].example,
				options: commands[key].options,
				category: commands[key].category,
				subcommands: commands[key].subcommands,
			});
		});

		if (args.length == 0) {
			async function generateEmbed() {
				const embed: any = {
					title: "Commands",
					color: "#f98692",
					description: await parseMessagePlaceholderFromString(
						message,
						"Use `{prefix}help <command>` to see how a specific command works."
					),
					fields: [],
				};

				// ? Parse Categories
				options.forEach((c) => {
					if (
						!categories.includes(c.category) &&
						c.category != undefined
					) {
						categories.push(c.category);
					}

					return void {};
				});

				for (let i = 0; i < categories.length; i++) {
					let field = {
						name: "",
						value: "",
					};

					options
						.filter((c) => c.category == categories[i])
						.forEach((c) => {
							field.name = categories[i];
							field.value = field.value.concat(` \`${c.name}\` `);
						});

					embed.fields.push(field);
				}

				return embed;
			}

			message.channel.send({
				embeds: [await generateEmbed()],
			});
		}

		if (args.length == 1) {
			if (!requested_command)
				return message.channel.send({
					embeds: [CommandNotFound], // import now
				});

			const embed: any = {
				title: await parseMessagePlaceholderFromString(
					message,
					`{prefix}${requested_command.name}`
				),
				color: "#1df27d",
				description:
					requested_command.description || "No description provided.",
				fields: [],
			};

			let field_index = 0;
			Object.keys(requested_command).forEach(async (key) => {
				if (requested_command[key] != undefined) {
					if (
						key == "name" ||
						key == "run" ||
						key == "description" ||
						key == "category" ||
						key == "subcommands"
					)
						return;

					if (typeof requested_command[key] == "object") {
						embed.fields.push({
							name: key.charAt(0).toUpperCase() + key.slice(1),
							value: requested_command[key].join("\n"),
							inline: false,
						});

						field_index++;
					} else {
						embed.fields.push({
							name: key.charAt(0).toUpperCase() + key.slice(1),
							value: await parseMessagePlaceholderFromString(
								message,
								requested_command[key]
							),
							inline: false,
						});
						field_index++;
					}
				}
			});

			return message.channel.send({
				embeds: [embed],
			});
		}

		if (subcommand.length > 0) {
			subcommand = subcommand.join(" ");

			if (!requested_command)
				return message.channel.send({
					embeds: [CommandNotFound], // import now
				});

			const subcommands_list = requested_command.subcommands;

			if (!subcommands_list)
				return message.channel.send({
					embeds: [
						{
							title: "No, you can't do this.",
							description: `This command does not have sub-commands.`,
							color: "#ea6112",
						},
					],
				});

			let requested_subcommand = subcommands_list.filter(
				(c: { name: string; config: any }) =>
					c.config.name == subcommand
			)[0];

			if (!requested_subcommand || !requested_command)
				return message.channel.send({
					embeds: [
						{
							title: "What is this?",
							description:
								await parseMessagePlaceholderFromString(
									message,
									`Provide a valid sub-command! Use \`{prefix}help ${requested_command.name}\` for more info.`
								),
							color: "#ea6112",
						},
					],
				});

			requested_subcommand = requested_subcommand.config;

			message.channel.send({
				embeds: [
					{
						title: await parseMessagePlaceholderFromString(
							message,
							`{prefix}${requested_command.name} ${requested_subcommand.name}`
						),
						description: await parseMessagePlaceholderFromString(
							message,
							requested_subcommand.description
						),
						color: "#1df27d",
						fields: [
							{
								name: "Syntax",
								value: await parseMessagePlaceholderFromString(
									message,
									requested_subcommand.syntax
								),
							},
						],
					},
				],
			});
		}
	},
};
