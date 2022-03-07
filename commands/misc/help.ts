import { Client, Message } from "discord.js";
import commands from "./../";

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
				category: commands[key].category,
			});
		});

		if (args.length < 1) {
			function generateEmbed() {
				const embed: any = {
					title: "Dumbass, you can't use a simple command?",
					color: "#f98692",
					description:
						"Use `!help <command>` to see how the command works.",
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

			const embed: any = {
				title: `How to use __${requested_command.name}__ command:`,
				color: "#1df27d",
				description:
					requested_command.description || "No description provided.",
				fields: [],
			};

			Object.keys(requested_command).forEach((key) => {
				if (requested_command[key] != undefined) {
					if (
						key == "name" ||
						key == "run" ||
						key == "description" ||
						key == "category"
					)
						return;

					embed.fields.push({
						name: key.charAt(0).toUpperCase() + key.slice(1),
						value: requested_command[key],
					});
				}
			});

			message.channel.send({
				embeds: [embed],
			});
		}
	},
};
