import { Client, Message } from "discord.js";
import commands from "./../";
import CommandNotFound from "./../../data/embeds/CommandNotFound";
export default {
	name: "help",
	run: async (bot: Client, message: Message, args: string[]) => {
		const options: any[] = [];
		const categories: string[] = [];

		Object.keys(commands).forEach((key) => {
			options.push({
				name: commands[key].name,
				syntax: commands[key].syntax,
				description: commands[key].description,
				example: commands[key].example,
				options: commands[key].options,
				category: commands[key].category,
				fields_config: commands[key].fields_config,
			});
		});

		if (args.length < 1) {
			function generateEmbed() {
				const embed: any = {
					title: "Commands",
					color: "#f98692",
					description:
						"Use `!help <command>` to see how a specific command works.",
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
				embeds: [generateEmbed()],
			});
		} else {
			let requested_command: any = args.pop();

			if (requested_command == undefined)
				return message.channel.send("Provide a valid command.");

			requested_command = commands[requested_command];

			if (!requested_command) return message.channel.send({
				embeds: [CommandNotFound]
			});

			const embed: any = {
				title: `!${requested_command.name}`,
				color: "#1df27d",
				description:
					requested_command.description || "No description provided.",
				fields: [],
			};

			let field_index = 0;
			Object.keys(requested_command).forEach((key) => {
				if (requested_command[key] != undefined) {
					
					if (
						key == "name" ||
						key == "run" ||
						key == "description" ||
						key == "category" || 
						key == "fields_config"
					)
						return;

					if (typeof(requested_command[key]) == "object") {
						embed.fields.push({
							name: key.charAt(0).toUpperCase() + key.slice(1),
							value: requested_command[key].join("\n"),
							inline: requested_command["fields_config"] ? requested_command["fields_config"][field_index] : false
						});
						

						field_index++;
					} else {
						embed.fields.push({
							name: key.charAt(0).toUpperCase() + key.slice(1),
							value: requested_command[key],
							inline: requested_command["fields_config"] ? requested_command["fields_config"][field_index] : false
						});
						field_index++;
					}
				}
			});

			message.channel.send({
				embeds: [embed],
			});
		}
	},
};
